import React, { useState, useEffect } from "react";
import { db, auth } from "./firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "firebase/auth";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function App() {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [contacts, setContacts] = useState([]);
  const [editId, setEditId] = useState(null);

  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 🔐 Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // 🔁 Firestore realtime
  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(collection(db, "contacts"), (snapshot) => {
      const dataList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setContacts(dataList);
    });

    return () => unsubscribe();
  }, [user]);

  // 🔐 Login
  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      alert(err.message);
    }
  };

  // 🔐 Logout
  const handleLogout = () => {
    signOut(auth);
  };

  // ➕ Add / ✏️ Update
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !mobile) return alert("Fill all fields");
    if (!/^\d{10}$/.test(mobile)) return alert("Invalid mobile");

    try {
      if (editId) {
        await updateDoc(doc(db, "contacts", editId), { name, mobile });
        setEditId(null);
      } else {
        await addDoc(collection(db, "contacts"), {
          name,
          mobile,
          createdAt: new Date()
        });
      }

      setName("");
      setMobile("");

    } catch (err) {
      console.error(err);
    }
  };

  // ✏️ Edit
  const handleEdit = (item) => {
    setName(item.name.toLowerCase());
    setMobile(item.mobile);
    setEditId(item.id);
  };

  // ❌ Delete
  const handleDelete = async (id) => {
    if (window.confirm("Delete?")) {
      await deleteDoc(doc(db, "contacts", id));
    }
  };

  // 🔍 Search filter
  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.mobile.includes(search)
  );

  // 📄 Pagination
  const indexLast = currentPage * recordsPerPage;
  const indexFirst = indexLast - recordsPerPage;
  const currentData = filtered.slice(indexFirst, indexLast);
  const totalPages = Math.ceil(filtered.length / recordsPerPage);

  // 📥 Export Excel
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(contacts);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Contacts");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer]), "contacts.xlsx");
  };

  // 🔐 Login screen
  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Login</h2>
        <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <br /><br />
        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
        <br /><br />
        <button onClick={handleLogin}>Login</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Contact Form</h2>

      <button onClick={handleLogout}>Logout</button>
      <br /><br />

      <form onSubmit={handleSubmit}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
        <br /><br />
        <input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="Mobile" />
        <br /><br />
        <button>{editId ? "Update" : "Submit"}</button>
      </form>

      <hr />

      <input
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <br /><br />

      <button onClick={exportExcel}>Export Excel</button>

      <h3>Contacts</h3>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Name</th>
            <th>Mobile</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentData.map((item) => (
            <tr key={item.id}>
              <td>{item.name.toLowerCase()}</td>
              <td>{item.mobile}</td>
              <td>
                <button onClick={() => handleEdit(item)}>Edit</button>
                <button onClick={() => handleDelete(item.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <br />

      <div>
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Prev</button>
        <span> Page {currentPage} / {totalPages} </span>
        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
      </div>
    </div>
  );
}

export default App;