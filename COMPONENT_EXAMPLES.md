# Component Usage Examples

## 🎨 Button Component Examples

### Basic Usage
```jsx
import Button from "./components/Button";

// Simple button
<Button>Click Me</Button>

// Primary button with large size
<Button variant="primary" size="lg">Add Item</Button>

// Success button with icon
<Button variant="success" icon="✓">Save</Button>
```

### With Callbacks
```jsx
<Button 
  variant="primary" 
  onClick={() => console.log("Clicked!")}
>
  Submit
</Button>

<Button 
  variant="danger" 
  icon="🗑️"
  onClick={handleDelete}
>
  Delete
</Button>
```

### Form Submission
```jsx
<form onSubmit={handleSubmit}>
  <input type="text" />
  <Button type="submit" variant="primary">
    Submit Form
  </Button>
</form>
```

### All Variants
```jsx
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="success">Success</Button>
<Button variant="warning">Warning</Button>
<Button variant="danger">Danger</Button>
<Button variant="info">Info</Button>
```

### All Sizes
```jsx
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
```

### Disabled State
```jsx
<Button disabled>Disabled Button</Button>
<Button loading={true}>Loading...</Button>
```

### Full Width
```jsx
<Button fullWidth variant="primary">
  Full Width Button
</Button>
```

---

## 🎴 Card Component Examples

### Statistics Card
```jsx
<Card 
  title="Total Items" 
  value={150}
  icon="📦"
  variant="info"
/>
```

### Success Card
```jsx
<Card 
  title="Available Items" 
  value={120}
  icon="✅"
  variant="success"
  subtitle="Ready to use"
/>
```

### Card with Children
```jsx
<Card 
  title="Summary" 
  icon="📊"
  variant="default"
>
  <p>Custom content goes here</p>
  <ul>
    <li>Item 1</li>
    <li>Item 2</li>
  </ul>
</Card>
```

### Warning Card
```jsx
<Card 
  title="Near Expiry" 
  value={8}
  icon="⏰"
  variant="warning"
  subtitle="Needs immediate action"
/>
```

### Danger Card
```jsx
<Card 
  title="Expired" 
  value={2}
  icon="❌"
  variant="danger"
/>
```

### Card Grid
```jsx
<div className="dashboard-stats">
  <Card title="Total" value={100} icon="📦" variant="info" />
  <Card title="Fresh" value={85} icon="✅" variant="success" />
  <Card title="Expiring" value={10} icon="⏰" variant="warning" />
  <Card title="Expired" value={5} icon="❌" variant="danger" />
</div>
```

---

## 🚨 AlertCard Component Examples

### Basic Alert Card
```jsx
import AlertCard from "./components/AlertCard";

const item = {
  id: 1,
  name: "Tomatoes",
  category: "Vegetables",
  quantity: 5,
  unit: "kg",
  expiry_date: "2024-02-05",
  storage_location: "Fridge",
  status: "Available"
};

<AlertCard 
  item={item}
  onAction={handleStatusUpdate}
/>
```

### In a List
```jsx
{alerts.map(item => (
  <AlertCard 
    key={item.id}
    item={item}
    onAction={(id, status) => {
      updateFoodStatus(id, status);
      fetchAlerts(); // refresh
    }}
  />
))}
```

### Handling Actions
```jsx
const handleAction = async (id, status) => {
  try {
    await updateFoodStatus(id, status);
    console.log(`Item ${id} marked as ${status}`);
    // Refresh the list
    fetchAlerts();
  } catch (error) {
    console.error("Error:", error);
  }
};

<AlertCard 
  item={item}
  onAction={handleAction}
/>
```

---

## 📋 Complete Page Examples

### Dashboard Page
```jsx
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import Button from "../components/Button";
import { getInventory } from "../services/foodService";

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    nearExpiry: 0,
    expired: 0
  });

  useEffect(() => {
    getInventory().then(data => {
      // Calculate stats
      setStats({
        total: data.length,
        available: data.filter(i => i.status === "Available").length,
        nearExpiry: data.filter(i => isNearExpiry(i)).length,
        expired: data.filter(i => isExpired(i)).length
      });
    });
  }, []);

  return (
    <div>
      <Navbar />
      <h1>Dashboard</h1>
      
      <div className="dashboard-stats">
        <Card title="Total" value={stats.total} icon="📦" variant="info" />
        <Card title="Available" value={stats.available} icon="✅" variant="success" />
        <Card title="Near Expiry" value={stats.nearExpiry} icon="⏰" variant="warning" />
        <Card title="Expired" value={stats.expired} icon="❌" variant="danger" />
      </div>

      <Button variant="primary" size="lg">Add New Item</Button>
    </div>
  );
};
```

### Inventory with Search and Filter
```jsx
import { useState, useEffect } from "react";
import Button from "../components/Button";
import { getInventory } from "../services/foodService";

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "All" || item.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="inventory-page">
      <input 
        type="text" 
        placeholder="Search items..."
        value={search}
        onChange={handleSearch}
      />
      
      <div className="filter-buttons">
        <Button onClick={() => setFilter("All")}>All</Button>
        <Button onClick={() => setFilter("Available")}>Available</Button>
        <Button onClick={() => setFilter("Used")}>Used</Button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map(item => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.status}</td>
              <td>
                <Button size="sm" variant="success">Use</Button>
                <Button size="sm" variant="info">Donate</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

### Form with Validation
```jsx
import { useState } from "react";
import Button from "../components/Button";
import { addFoodItem } from "../services/foodService";

const AddItem = () => {
  const [form, setForm] = useState({
    name: "",
    category: "",
    expiry_date: ""
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.name || !form.category) {
      setMessage("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      await addFoodItem(form);
      setMessage("Item added successfully!");
      setForm({ name: "", category: "", expiry_date: "" });
    } catch (error) {
      setMessage("Error adding item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {message && <div className="message">{message}</div>}
      
      <input 
        type="text"
        placeholder="Food name"
        value={form.name}
        onChange={(e) => setForm({...form, name: e.target.value})}
      />
      
      <select 
        value={form.category}
        onChange={(e) => setForm({...form, category: e.target.value})}
      >
        <option value="">Select Category</option>
        <option value="Vegetables">Vegetables</option>
        <option value="Fruits">Fruits</option>
      </select>
      
      <input 
        type="date"
        value={form.expiry_date}
        onChange={(e) => setForm({...form, expiry_date: e.target.value})}
      />
      
      <Button type="submit" variant="primary" loading={loading}>
        Add Item
      </Button>
    </form>
  );
};
```

---

## 🎨 Styling Examples

### Using CSS Variables
```css
.my-element {
  color: var(--color-primary);
  padding: var(--spacing-lg);
  font-size: var(--font-size-base);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-base);
}

.my-element:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

### Utility Classes
```jsx
<div className="flex gap-lg mt-xl mb-lg">
  <h1 className="text-center mb-md">Title</h1>
  <p className="text-muted">Subtitle</p>
</div>
```

### Responsive Grid
```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
}
```

---

## 🚀 Best Practices

### 1. Always use CSS Variables
```jsx
// ✅ Good
color: var(--color-primary);

// ❌ Avoid
color: #2ecc71;
```

### 2. Maintain Component Hierarchy
```jsx
// ✅ Good
<Navbar />
<main className="dashboard">
  <Card />
  <Button />
</main>

// ❌ Avoid
<Button />
<Navbar />
<Card />
```

### 3. Responsive Images and Icons
```jsx
// ✅ Good
<div className="icon">🎨</div>

// ❌ Avoid
<img src="icon.png" style={{width: "500px"}} />
```

### 4. Proper Spacing with Utility Classes
```jsx
// ✅ Good
<div className="mt-lg mb-md px-lg">Content</div>

// ❌ Avoid
<div style={{marginTop: "24px", marginBottom: "16px"}}>Content</div>
```

### 5. Loading States
```jsx
// ✅ Good
<Button disabled={loading}>
  {loading ? "Processing..." : "Submit"}
</Button>

// ❌ Avoid
<Button>Submit</Button>
```

---

## 🧪 Testing Components

### Test Button Variants
```jsx
describe("Button Component", () => {
  it("renders all variants", () => {
    const variants = ["primary", "secondary", "success", "danger", "warning", "info"];
    variants.forEach(variant => {
      render(<Button variant={variant}>Test</Button>);
      expect(screen.getByText("Test")).toHaveClass(`btn-${variant}`);
    });
  });
});
```

### Test Card Component
```jsx
describe("Card Component", () => {
  it("displays title and value", () => {
    render(<Card title="Items" value={10} />);
    expect(screen.getByText("Items")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });
});
```

---

## 📚 Resources

- View all components: `/src/components/`
- View styles: `/src/styles/`
- View pages: `/src/pages/`
- CSS Variables: `/src/styles/globals.css`

---

**Happy coding! 🎉**
