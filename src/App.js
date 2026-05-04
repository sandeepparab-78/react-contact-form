import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  onSnapshot
} from "firebase/firestore";

function App() {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [contacts, setContacts] = useState([]);

  // 🔁 Real-time data fetch
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "contacts"), (snapshot) => {
      const dataList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setContacts(dataList);
    });

    return () => unsubscribe();
  }, []);

  // ➕ Add new record
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !mobile) {
      alert("Please fill all fields");
      return;
    }

    // simple mobile validation
    if (!/^\d{10}$/.test(mobile)) {
      alert("Enter valid 10-digit mobile number");
      return;
    }

    try {
      await addDoc(collection(db, "contacts"), {
        name: name,
        mobile: mobile,
        createdAt: new Date()
      });

      alert("Data saved successfully!");

      // clear form
      setName("");
      setMobile("");

    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Contact Form</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <br /><br />

        <input
          type="text"
          placeholder="Enter Mobile"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
        />
        <br /><br />

        <button type="submit">Submit</button>
      </form>

      <hr />

      <h3>Saved Contacts</h3>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Name</th>
            <th>Mobile</th>
          </tr>
        </thead>
        <tbody>
          {contacts.length === 0 ? (
            <tr>
              <td colSpan="2">No data found</td>
            </tr>
          ) : (
            contacts.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.mobile}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;