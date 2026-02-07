from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    phone = db.Column(db.String(15))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Food(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable = False)
    category = db.Column(db.String(50), nullable = False)
    name = db.Column(db.String(100), nullable = False)
    quantity = db.Column(db.Float, nullable = False)
    unit = db.Column(db.String(20))
    purchase_date = db.Column(db.Date)
    expiry_date = db.Column(db.Date)
    storage_location = db.Column(db.String(100))
    status = db.Column(db.String(20), default = "AVAILABLE")
    reason_of_waste = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default = datetime.utcnow)

class Category(db.Model):
    id =db.Column(db.Integer, primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable = False)
    name = db.Column(db.String(20), nullable = False)

class Userlog(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable = False)
    food_id = db.Column(db.Integer, db.ForeignKey("food.id"), nullable = False)
    action = db.Column(db.String(20), nullable = False)
    quantity = db.Column(db.Float, nullable = False)
    action_date = db.Column(db.Date, default = datetime.utcnow)
    reason = db.Column(db.String(100))
    remarks = db.Column(db.String(100))

class DonationCenter(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    city = db.Column(db.String(50))
    address = db.Column(db.String(200))
    phone = db.Column(db.String(15))
    email = db.Column(db.String(120))
    accepts_items = db.Column(db.String(100))  # e.g. "cooked,dry,dairy"
    open_hours = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class DonationOffer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    donation_center_id = db.Column(db.Integer, db.ForeignKey("donation_center.id"))
    status = db.Column(db.String(20), default="PENDING")  # PENDING, ACCEPTED, REJECTED, PICKED_UP, CANCELLED
    remarks = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class DonationOfferItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    donation_offer_id = db.Column(db.Integer, db.ForeignKey("donation_offer.id"), nullable=False)
    food_id = db.Column(db.Integer, db.ForeignKey("food.id"), nullable=False)
    quantity = db.Column(db.Float, nullable=False)