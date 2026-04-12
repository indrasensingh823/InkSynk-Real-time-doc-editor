# 📝REAL-TIME COLLABORATIVE DOCUMENT EDITOR


---
**COMPANY**: CODTECH IT SOLUTIONS  
**NAME**: INDRASEN SINGH  
**INTERN ID**: CT04DN1461
**DOMAIN**: FRONT END DEVELOPMENT  
**DURATION**: 4 WEEKS  
**MENTOR**: NEELA SANTOSH  

---

A **Real-Time Collaborative Document Editor** is an advanced, feature-rich web application designed to enhance productivity by enabling multiple users to create, view, and edit documents together in real-time. This app replicates the core functionality of platforms like Google Docs but provides a lightweight and customizable solution for teams, students, and professionals. 

The frontend is developed using **React.js**, delivering a smooth and responsive user interface, while the backend is powered by **Node.js** and **Express.js** for robust server-side logic. **Socket.IO** is used to establish real-time bidirectional communication between users, ensuring that every keystroke or formatting change is instantly reflected for all collaborators. This live collaboration experience significantly improves workflow, especially in academic, corporate, or remote working environments.

The app also includes intelligent document handling, automatic saving, and unique document ID routing for easy sharing. Whether you're drafting reports, notes, or letters, this tool empowers users to collaborate from anywhere — seamlessly and securely.


---

## 📸 Screenshot

![Image](https://github.com/user-attachments/assets/01cb791d-7b43-481d-a561-93c1ac1cf311)
![Image](https://github.com/user-attachments/assets/8a92dab0-473c-4f4e-8e3a-ba7388b11e3c)


---


## 🚀 Features

- ✅ Real-time document editing using WebSockets
- ✅ Multi-user collaboration
- ✅ User-friendly rich text editor (Quill.js)
- ✅ Automatic document saving
- ✅ Join/Edit documents using unique document IDs
- ✅ Responsive and modern UI
- ✅ Deployed on **Railway** (free hosting with sleep mode)

---

## 🛠️ Tech Stack

| Frontend     | Backend     | Real-Time Engine | Deployment |
|--------------|-------------|------------------|------------|
| React.js     | Node.js     | Socket.IO        | Railway    |
| React Router | Express.js  |                  |            |
| Quill.js     | MongoDB     |                  |            |

---

## 🔧 Installation Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/real-time-doc-editor.git
cd real-time-doc-editor
```


### 2. Install Dependencies
Server:
```bash
cd server
npm install
```

Client:
```bash
cd ../client
npm install
```


### 3. Environment Variables
Create a .env file inside the server directory with the following:
```bash
PORT=5002
MONGO_URI=your_mongodb_uri
```


### 4. Run the Application Locally
In two terminals:
```bash
# Terminal 1
cd server
npm start

# Terminal 2
cd client
npm start
```
The React app runs on http://localhost:3000
The backend runs on http://localhost:5002

---

## Learning Concepts
- WebSockets and real-time data flow
- State management with React Hooks
- Server-client architecture
- MongoDB data persistence
- Deployment to Railway with environment variables

  
---

## ✉️ Contact

Feel free to contribute, report issues, or suggest new features!

- 🌟 GitHub: [indrasensingh823](https://github.com/indrasensingh823)
- 📧 Email: indrasensingh823@gmail.com

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).

---

## 🙏 Acknowledgements

- [Quill.js](https://quilljs.com/) - For the rich text editor.
- [Socket.IO](https://socket.io/) - For real-time communication.
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - For cloud-based document storage.
- [Railway.app](https://railway.app/) - For simplified full-stack deployment.

---

> Made with ❤️ by Indrasen Singh


