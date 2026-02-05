from flask import Flask, request, jsonify
from datetime import datetime, date, timedelta
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity
)
from werkzeug.security import generate_password_hash, check_password_hash

from config import Config
from models import db, User, Food, Category, Userlog, DonationCenter, DonationOffer, DonationOfferItem

# ---------------- APP SETUP ----------------
app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)
jwt = JWTManager(app)

# ---------------- CREATE DATABASE ----------------
with app.app_context():
    db.create_all()

# ---------------- REGISTER ----------------
@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json()

    if not data:
        return jsonify({"error": "JSON body required"}), 400

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    phone = data.get("phone")

    if not name or not email or not password:
        return jsonify({"error": "Missing fields"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already exists"}), 400

    hashed_password = generate_password_hash(password)

    user = User(
        name=name,
        email=email,
        password=hashed_password,
        phone=phone
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201

# ---------------- LOGIN ----------------
@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data:
        return jsonify({"error": "JSON body required"}), 400

    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password, password):
        return jsonify({"error": "Invalid credentials"}), 401

    access_token = create_access_token(identity= str(user.id))

    return jsonify({
        "access_token": access_token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone
        }
    })

@app.route("/api/category", methods = ["POST", "GET"])
@jwt_required()
def category ():
    user_id = get_jwt_identity()
    if request.method == "POST":
        
        data = request.get_json()

        category_name = data.get("category")
        category = Category(
            user_id = user_id,
            name = category_name,
        )
        db.session.add(category)
        db.session.commit()
        return jsonify({"message": "Category Added Successfully"}), 201
    else:
        data = Category.query.filter_by( user_id = user_id)
        category = []
        for d in data :
           category_items =  {
               "id": d.id,
               "name": d.name,
           }
           category.append(category_items)
        return jsonify(
            {
                "category": category
            }
        )
@app.route("/api/category/<int:id>", methods = ["DELETE"])
@jwt_required()
def delete_category(id):
    data = Category.query.get_or_404(id)
    db.session.delete(data)
    db.session.commit()
    return jsonify({"message": "category deleted successfully"})

#------- Food System----------------
#------- Add Food Items------------
@app.route("/api/food", methods = ["POST"])
@jwt_required()
def create_food():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    purchase_date = datetime.strptime(data["purchase_date"], "%Y-%m-%d").date() if data.get("purchase_date") else None
    expiry_date = datetime.strptime(data["expiry_date"], "%Y-%m-%d").date() if data.get("expiry_date") else None

    food = Food(
        user_id = user_id,
        name = data.get ("name"),
        category=data.get("category"),
        quantity=data.get("quantity"),
        unit=data.get("unit"),
        purchase_date=purchase_date,
        expiry_date=expiry_date,
    )

    db.session.add(food)
    db.session.commit()

    return jsonify({"message": "Succesfully added food items"}), 201


def get_expiry_info(food_item):
    if not food_item.expiry_date:
        return None, None
    
    today = date.today()
    days_left = (food_item.expiry_date - today).days

    if days_left < 0:
        state = "EXPIRED"
    elif 1<= days_left <=3:
        state = "NEAR_EXPIRY"
    else:
        state = "FRESH"

    return state, days_left 

#----- List food items ----
@app.route("/api/food", methods=["GET"])
@jwt_required()
def food_list():
    user_id = get_jwt_identity()
    items = Food.query.filter_by(user_id = user_id).all()

    available_items = []
    expired_items = []
    used_items = []
    donated_items = []
    wasted_items = []

    for item in items:
        expiry_state, days_left = get_expiry_info(item)
        item_data = {
            "id": item.id,
            "name": item.name,
            "category": item.category,
            "quantity": item.quantity,
            "unit": item.unit,
            "expiry_date": item.expiry_date,
            "status": item.status,
            "expiry_state": expiry_state,
            "days_left": days_left
        }
        if item.status == "AVAILABLE" and expiry_state == "EXPIRED":
            expired_items.append(item_data)
        elif item.status == "AVAILABLE":
            available_items.append(item_data)
        elif item.status == "USED":
            used_items.append(item_data)
        elif item.status == "DONATED":
            donated_items.append(item_data)
        elif item.status == "WASTED":
            wasted_items.append(item_data)
    expired_items.sort(key=lambda x: x["days_left"])  # most negative first
    available_items.sort(
        key=lambda x: (
            0 if x["expiry_state"] == "NEAR_EXPIRY" else 1,
            x["days_left"] if x["days_left"] is not None else 999
        )
    )

    return jsonify({
        "expired_count": len(expired_items),
        "available_count": len(available_items),
        "expired_items": expired_items,
        "available_items": available_items,
        "used_items": len(used_items),
        "donated_items": len(donated_items),
        "wasted_items": len(wasted_items),
        "used_items": used_items,
        "donated_items": donated_items,
        "wasted_items": wasted_items
    })

    

@app.route("/api/food/alerts", methods=["GET"])
@jwt_required()
def expiry_alerts():
    user_id = get_jwt_identity()
    items = Food.query.filter_by(user_id = user_id, status = "AVAILABLE").all()
    alerts = []
    expired_count = 0
    near_expiry_count = 0

    for item in items:
        expiry_state, days_left = get_expiry_info(item)

        if expiry_state == "EXPIRED":
            expired_count += 1
        elif expiry_state == "NEAR_EXPIRY":
            near_expiry_count += 1

        if expiry_state in ["EXPIRED", "NEAR_EXPIRY"]:
            alerts.append({
                "id": item.id,
                "name": item.name,
                "category": item.category,
                "expiry_date": item.expiry_date,
                "expiry_state": expiry_state,
                "days_left": days_left
            })
    
    alerts.sort(key=lambda x: x["days_left"])

    return jsonify({
        "expired_count": expired_count,
        "near_expiry_count": near_expiry_count,
        "total_alerts": expired_count + near_expiry_count,
        "items": alerts
    })

#------Update Food-------------
@app.route("/api/food/<int:id>", methods = ["PUT"])
@jwt_required()
def update_food(id):
    user_id = get_jwt_identity()
    food = Food.query.get_or_404(id)

    data = request.get_json()

    food.quantity = data.get("quantity", food.quantity)
    food.expiry_date = data.get("expiry_date", food.expiry_date)
    food.status = data.get("status", food.status)
    food.reason_of_waste = data.get("wasted_reason", food.reason_of_waste)

    db.session.commit()
    return jsonify({"message": "Food item successfully updated"})

#-------------Delete Food----------
@app.route("/api/food/<int:id>", methods = ["DELETE"])
@jwt_required()
def delete_food(id):
    user_id = get_jwt_identity()
    food = Food.query.get_or_404(id)

    db.session.delete(food)
    db.session.commit()

    return jsonify({"message": "Food item is successfully deleted"})

#------------Update Status--------------
@app.route("/api/food/<int:id>/status", methods=["PATCH"])
@jwt_required()
def change_status(id):
    user_id = get_jwt_identity()
    food = Food.query.get_or_404(id)

    data = request.get_json()
    food.status = str(data.get("status")).upper()

    if food.status == 'Wasted':
        food.reason_of_waste = data.get("reason")

    db.session.commit()
    return jsonify({"message": "Status updated successfully"})


# ---------------- GET PROFILE ----------------
@app.route("/api/users/me", methods=["GET"])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "created_at": user.created_at
    })

# ---------------- UPDATE PROFILE ----------------
@app.route("/api/users/me", methods=["PUT"])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    data = request.get_json()

    user.name = data.get("name", user.name)
    user.phone = data.get("phone", user.phone)

    db.session.commit()

    return jsonify({"message": "Profile updated successfully"})

# ---------------- DELETE PROFILE ----------------
@app.route("/api/users/me", methods=["DELETE"])
@jwt_required()
def delete_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    db.session.delete(user)
    db.session.commit()

    return jsonify({"message": "User deleted successfully"})

# ---------------- FOOD LOGS CRUD ----------------
# ------- Create Food Log -------
@app.route("/api/food-logs", methods=["POST"])
@jwt_required()
def create_food_log():
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data:
        return jsonify({"error": "JSON body required"}), 400

    food_id = data.get("food_id")
    action = str(data.get("action", "")).upper()
    quantity = data.get("quantity")

    if not food_id or not action or not quantity:
        return jsonify({"error": "Missing required fields: food_id, action, quantity"}), 400

    if action not in ["USED", "DONATED", "WASTED"]:
        return jsonify({"error": "Invalid action. Must be USED, DONATED, or WASTED"}), 400

    food = Food.query.get_or_404(food_id)

    if str(food.user_id) != str(user_id):
        return jsonify({"error": "Unauthorized access to food item"}), 403

    if quantity > food.quantity:
        return jsonify({"error": "Quantity exceeds available food quantity"}), 400

    # Create log entry
    log = Userlog(
        user_id=user_id,
        food_id=food.id,
        action=action,
        quantity=quantity,
        reason=data.get("reason"),
        remarks=data.get("remarks")
    )

    # Update food quantity
    food.quantity -= quantity
    if food.quantity <= 0:
        food.status = action
        food.quantity = 0
        if action == "WASTED":
            food.reason_of_waste = data.get("reason")

    db.session.add(log)
    db.session.commit()

    return jsonify({"message": "Food log created successfully"}), 201

# ------- List Food Logs -------
@app.route("/api/food-logs", methods=["GET"])
@jwt_required()
def list_food_logs():
    user_id = get_jwt_identity()
    
    # Optional filters
    action_filter = request.args.get("action")
    food_id_filter = request.args.get("food_id")

    query = Userlog.query.filter_by(user_id=user_id)

    if action_filter:
        query = query.filter_by(action=action_filter.upper())
    if food_id_filter:
        query = query.filter_by(food_id=food_id_filter)

    logs = query.order_by(Userlog.action_date.desc()).all()

    log_list = []
    for log in logs:
        food = Food.query.get(log.food_id)
        log_data = {
            "id": log.id,
            "food_id": log.food_id,
            "food_name": food.name if food else None,
            "action": log.action,
            "quantity": log.quantity,
            "action_date": log.action_date,
            "reason": log.reason,
            "remarks": log.remarks
        }
        log_list.append(log_data)

    return jsonify({"food_logs": log_list, "total_count": len(log_list)})

# ------- Get Food Log by ID -------
@app.route("/api/food-logs/<int:id>", methods=["GET"])
@jwt_required()
def get_food_log(id):
    user_id = get_jwt_identity()
    log = Userlog.query.get_or_404(id)

    if str(log.user_id) != str(user_id):
        return jsonify({"error": "Unauthorized access to food log"}), 403

    food = Food.query.get(log.food_id)

    return jsonify({
        "id": log.id,
        "food_id": log.food_id,
        "food_name": food.name if food else None,
        "action": log.action,
        "quantity": log.quantity,
        "action_date": log.action_date,
        "reason": log.reason,
        "remarks": log.remarks
    })

# ------- Delete Food Log -------
@app.route("/api/food-logs/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_food_log(id):
    user_id = get_jwt_identity()
    log = Userlog.query.get_or_404(id)

    if str(log.user_id) != str(user_id):
        return jsonify({"error": "Unauthorized access to food log"}), 403

    db.session.delete(log)
    db.session.commit()

    return jsonify({"message": "Food log deleted successfully"})

# ---------------- ANALYTICS ----------------
@app.route("/api/analytics", methods=["GET"])
@jwt_required()
def analytics():
    user_id = get_jwt_identity()
    
    # Get time period filter from query params
    period = request.args.get("period", "overall").lower()
    
    # Calculate date range based on period
    today = date.today()
    start_date = None
    
    if period == "today":
        start_date = today
    elif period == "7days":
        start_date = today - timedelta(days=7)
    elif period == "30days":
        start_date = today - timedelta(days=30)
    # "overall" means no date filter
    
    # Build query
    query = Userlog.query.filter_by(user_id=user_id)
    
    if start_date:
        query = query.filter(Userlog.action_date >= start_date)
    
    logs = query.all()

    summary = {
        "USED": {"count": 0, "total_quantity": 0},
        "DONATED": {"count": 0, "total_quantity": 0},
        "WASTED": {"count": 0, "total_quantity": 0}
    }

    for log in logs:
        if log.action in summary:
            summary[log.action]["count"] += 1
            summary[log.action]["total_quantity"] += log.quantity

    # Calculate totals
    total_items = sum(s["count"] for s in summary.values())
    total_quantity = sum(s["total_quantity"] for s in summary.values())

    return jsonify({
        "period": period,
        "start_date": str(start_date) if start_date else None,
        "analytics": summary,
        "total_logged_items": total_items,
        "total_quantity_processed": total_quantity
    })

# ---------------- DONATION CENTERS CRUD ----------------
# ------- Create Donation Center -------
@app.route("/api/donation-centers", methods=["POST"])
@jwt_required()
def create_donation_center():
    data = request.get_json()

    if not data:
        return jsonify({"error": "JSON body required"}), 400

    name = data.get("name")
    if not name:
        return jsonify({"error": "Name is required"}), 400

    center = DonationCenter(
        name=name,
        city=data.get("city"),
        address=data.get("address"),
        phone=data.get("phone"),
        email=data.get("email"),
        accepts_items=data.get("accepts_items"),
        open_hours=data.get("open_hours")
    )

    db.session.add(center)
    db.session.commit()

    return jsonify({"message": "Donation center created successfully", "id": center.id}), 201

# ------- List Donation Centers -------
@app.route("/api/donation-centers", methods=["GET"])
def list_donation_centers():
    city_filter = request.args.get("city")

    query = DonationCenter.query

    if city_filter:
        query = query.filter(DonationCenter.city.ilike(f"%{city_filter}%"))

    centers = query.all()

    center_list = []
    for center in centers:
        center_list.append({
            "id": center.id,
            "name": center.name,
            "city": center.city,
            "address": center.address,
            "phone": center.phone,
            "email": center.email,
            "accepts_items": center.accepts_items,
            "open_hours": center.open_hours
        })

    return jsonify({"donation_centers": center_list, "total_count": len(center_list)})

# ------- Get Donation Center by ID -------
@app.route("/api/donation-centers/<int:id>", methods=["GET"])
def get_donation_center(id):
    center = DonationCenter.query.get_or_404(id)

    return jsonify({
        "id": center.id,
        "name": center.name,
        "city": center.city,
        "address": center.address,
        "phone": center.phone,
        "email": center.email,
        "accepts_items": center.accepts_items,
        "open_hours": center.open_hours,
        "created_at": center.created_at
    })

# ------- Update Donation Center -------
@app.route("/api/donation-centers/<int:id>", methods=["PUT"])
@jwt_required()
def update_donation_center(id):
    center = DonationCenter.query.get_or_404(id)
    data = request.get_json()

    center.name = data.get("name", center.name)
    center.city = data.get("city", center.city)
    center.address = data.get("address", center.address)
    center.phone = data.get("phone", center.phone)
    center.email = data.get("email", center.email)
    center.accepts_items = data.get("accepts_items", center.accepts_items)
    center.open_hours = data.get("open_hours", center.open_hours)

    db.session.commit()

    return jsonify({"message": "Donation center updated successfully"})

# ------- Delete Donation Center -------
@app.route("/api/donation-centers/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_donation_center(id):
    center = DonationCenter.query.get_or_404(id)

    db.session.delete(center)
    db.session.commit()

    return jsonify({"message": "Donation center deleted successfully"})

# ---------------- DONATION OFFERS CRUD ----------------
# ------- Create Donation Offer -------
@app.route("/api/donation-offers", methods=["POST"])
@jwt_required()
def create_donation_offer():
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data:
        return jsonify({"error": "JSON body required"}), 400

    items = data.get("items", [])
    if not items:
        return jsonify({"error": "At least one item is required"}), 400

    donation_center_id = data.get("donation_center_id")
    if donation_center_id:
        center = DonationCenter.query.get(donation_center_id)
        if not center:
            return jsonify({"error": "Donation center not found"}), 404

    # Create donation offer
    offer = DonationOffer(
        user_id=user_id,
        donation_center_id=donation_center_id,
        remarks=data.get("remarks")
    )
    db.session.add(offer)
    db.session.flush()  # Get offer ID

    # Add items to offer
    for item in items:
        food_id = item.get("food_id")
        quantity = item.get("quantity")

        if not food_id or not quantity:
            db.session.rollback()
            return jsonify({"error": "Each item must have food_id and quantity"}), 400

        food = Food.query.get(food_id)
        if not food:
            db.session.rollback()
            return jsonify({"error": f"Food item {food_id} not found"}), 404

        if str(food.user_id) != str(user_id):
            db.session.rollback()
            return jsonify({"error": f"Unauthorized access to food item {food_id}"}), 403

        if quantity > food.quantity:
            db.session.rollback()
            return jsonify({"error": f"Quantity exceeds available for food item {food_id}"}), 400

        offer_item = DonationOfferItem(
            donation_offer_id=offer.id,
            food_id=food_id,
            quantity=quantity
        )
        db.session.add(offer_item)

    db.session.commit()

    return jsonify({"message": "Donation offer created successfully", "id": offer.id}), 201

# ------- List Donation Offers -------
@app.route("/api/donation-offers", methods=["GET"])
@jwt_required()
def list_donation_offers():
    user_id = get_jwt_identity()
    status_filter = request.args.get("status")

    query = DonationOffer.query.filter_by(user_id=user_id)

    if status_filter:
        query = query.filter_by(status=status_filter.upper())

    offers = query.order_by(DonationOffer.created_at.desc()).all()

    offer_list = []
    for offer in offers:
        center = DonationCenter.query.get(offer.donation_center_id) if offer.donation_center_id else None
        items = DonationOfferItem.query.filter_by(donation_offer_id=offer.id).all()

        item_list = []
        for item in items:
            food = Food.query.get(item.food_id)
            item_list.append({
                "id": item.id,
                "food_id": item.food_id,
                "food_name": food.name if food else None,
                "quantity": item.quantity
            })

        offer_list.append({
            "id": offer.id,
            "donation_center_id": offer.donation_center_id,
            "donation_center_name": center.name if center else None,
            "status": offer.status,
            "remarks": offer.remarks,
            "created_at": offer.created_at,
            "items": item_list,
            "item_count": len(item_list)
        })

    return jsonify({"donation_offers": offer_list, "total_count": len(offer_list)})

# ------- Get Donation Offer by ID -------
@app.route("/api/donation-offers/<int:id>", methods=["GET"])
@jwt_required()
def get_donation_offer(id):
    user_id = get_jwt_identity()
    offer = DonationOffer.query.get_or_404(id)

    if str(offer.user_id) != str(user_id):
        return jsonify({"error": "Unauthorized access to donation offer"}), 403

    center = DonationCenter.query.get(offer.donation_center_id) if offer.donation_center_id else None
    items = DonationOfferItem.query.filter_by(donation_offer_id=offer.id).all()

    item_list = []
    for item in items:
        food = Food.query.get(item.food_id)
        item_list.append({
            "id": item.id,
            "food_id": item.food_id,
            "food_name": food.name if food else None,
            "quantity": item.quantity
        })

    return jsonify({
        "id": offer.id,
        "donation_center_id": offer.donation_center_id,
        "donation_center_name": center.name if center else None,
        "status": offer.status,
        "remarks": offer.remarks,
        "created_at": offer.created_at,
        "items": item_list
    })

# ------- Update Donation Offer Status -------
@app.route("/api/donation-offers/<int:id>/status", methods=["PATCH"])
@jwt_required()
def update_donation_offer_status(id):
    user_id = get_jwt_identity()
    offer = DonationOffer.query.get_or_404(id)

    if str(offer.user_id) != str(user_id):
        return jsonify({"error": "Unauthorized access to donation offer"}), 403

    data = request.get_json()
    new_status = str(data.get("status", "")).upper()

    valid_statuses = ["PENDING", "ACCEPTED", "REJECTED", "PICKED_UP", "CANCELLED"]
    if new_status not in valid_statuses:
        return jsonify({"error": f"Invalid status. Must be one of: {', '.join(valid_statuses)}"}), 400

    old_status = offer.status
    offer.status = new_status

    # When picked up, update food items to DONATED status and reduce quantities
    if new_status == "PICKED_UP" and old_status != "PICKED_UP":
        items = DonationOfferItem.query.filter_by(donation_offer_id=offer.id).all()
        for item in items:
            food = Food.query.get(item.food_id)
            if food:
                food.quantity -= item.quantity
                if food.quantity <= 0:
                    food.quantity = 0
                    food.status = "DONATED"

                # Create user log entry
                log = Userlog(
                    user_id=user_id,
                    food_id=food.id,
                    action="DONATED",
                    quantity=item.quantity,
                    reason=f"Donated to center ID: {offer.donation_center_id}",
                    remarks=offer.remarks
                )
                db.session.add(log)

    db.session.commit()

    return jsonify({"message": f"Donation offer status updated to {new_status}"})

# ------- Delete/Cancel Donation Offer -------
@app.route("/api/donation-offers/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_donation_offer(id):
    user_id = get_jwt_identity()
    offer = DonationOffer.query.get_or_404(id)

    if str(offer.user_id) != str(user_id):
        return jsonify({"error": "Unauthorized access to donation offer"}), 403

    if offer.status == "PICKED_UP":
        return jsonify({"error": "Cannot delete a picked up donation offer"}), 400

    # Delete offer items first
    DonationOfferItem.query.filter_by(donation_offer_id=offer.id).delete()

    db.session.delete(offer)
    db.session.commit()

    return jsonify({"message": "Donation offer deleted successfully"})

# ---------------- HEALTH CHECK ----------------
@app.route("/api/health")
def health():
    return jsonify({"status": "OK"})

# ---------------- RUN SERVER ----------------
if __name__ == "__main__":
    app.run(debug=True)
