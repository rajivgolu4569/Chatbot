function askQuestion() {
    const userInput = document.getElementById("user-input").value;
    if (!userInput) return;

    const chatBox = document.getElementById("chat-box");
    chatBox.innerHTML += `<div><strong>You:</strong> ${userInput}</div>`;

    fetch("http://localhost:5000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userInput }),
    })
    .then(response => response.json())
    .then(data => {
        chatBox.innerHTML += `<div><strong>Bot:</strong> ${data.answer}</div>`;
        chatBox.scrollTop = chatBox.scrollHeight;
    })
    .catch(error => console.error("Error:", error));

    document.getElementById("user-input").value = "";
}
