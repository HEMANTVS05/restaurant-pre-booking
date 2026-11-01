// auth.js - SIMPLE GOOGLE LOGIN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup 
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDsytFlHMxQ4U6RYHcslN8OC6az2jkLdjA",
    authDomain: "restaurant-9f07d.firebaseapp.com",
    projectId: "restaurant-9f07d",
    storageBucket: "restaurant-9f07d.appspot.com",
    messagingSenderId: "599854438974",
    appId: "1:599854438974:web:c5a4cb49b9d41babc74f6f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ONLY for login-page.html
if (document.getElementById("google-login-btn")) {
    document.getElementById("google-login-btn").addEventListener("click", function() {
        console.log("Google login clicked");
        
        signInWithPopup(auth, provider)
        .then((result) => {
            const user = result.user;
            
            // ✅ SAVE EMAIL (MOST IMPORTANT!)
            localStorage.setItem("userEmail", user.email);
            localStorage.setItem("username", user.displayName || user.email);
            
            console.log("✅ Login successful! Email:", user.email);
            
            // ✅ TRY TO RESTORE PREVIOUS ORDER
            try {
                const allOrders = JSON.parse(localStorage.getItem("orderHistory") || "{}");
                if (allOrders[user.email] && allOrders[user.email].length > 0) {
                    const latestOrder = allOrders[user.email][allOrders[user.email].length - 1];
                    
                    // Restore order data to localStorage
                    if (latestOrder.vegItems) {
                        localStorage.setItem("vegItems", JSON.stringify(latestOrder.vegItems));
                    }
                    if (latestOrder.nonvegItems) {
                        localStorage.setItem("nonvegItems", JSON.stringify(latestOrder.nonvegItems));
                    }
                    if (latestOrder.bookingDate) {
                        localStorage.setItem("bookingDate", latestOrder.bookingDate);
                    }
                    if (latestOrder.bookingTime) {
                        localStorage.setItem("bookingTime", latestOrder.bookingTime);
                    }
                    if (latestOrder.bookingPeople) {
                        localStorage.setItem("bookingPeople", latestOrder.bookingPeople);
                    }
                    
                    console.log("✅ Previous order restored to localStorage");
                }
            } catch (error) {
                console.error("Error restoring order:", error);
            }
            
            alert("Login successful! Welcome " + (user.displayName || user.email));
            window.location.href = "index.html";
        })
        .catch((error) => {
            console.error("Login error:", error);
            alert("Login failed: " + error.message);
        });
    });
}