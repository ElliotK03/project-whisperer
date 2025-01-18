document.getElementById("theform").addEventListener("submit", function (event) {
	event.preventDefault(); // prevents default button action
	const inputData = document.getElementById("URLinput").value;
	console.log("Form data:", inputData);

	fetch("/send", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ input: inputData }),
	})
		.then(data => {
			console.log("Server response:", data);
		})
		.catch(error => {
			console.error("Error:", error);
		});

	// Prevent re-binding if the button is clicked multiple times
	if (this.sseBound) return;

	// Mark SSE as bound
	this.sseBound = true;

	const eventSource = new EventSource('/send');
	eventSource.onmessage = function (event) {
		const messagesDiv = document.getElementById('messages');
		const newMessage = document.createElement('div');
		newMessage.textContent = event.data;
		messagesDiv.appendChild(newMessage);
	};
	eventSource.onerror = function (event) {
		const messagesDiv = document.getElementById('messages');
		const newMessage = document.createElement('div');
		newMessage.textContent = "Connection error!";
		messagesDiv.appendChild(newMessage);
		eventSource.close();
	};

	eventSource.onopen = function (event) {
		const messagesDiv = document.getElementById('messages');
		const newMessage = document.createElement('div');
		newMessage.textContent = "Connection opened!";
		messagesDiv.appendChild(newMessage);
	};
	eventSource.onclose = function (event) {
		const messagesDiv = document.getElementById('messages');
		const newMessage = document.createElement('div');
		newMessage.textContent = "Connection closed!";
		messagesDiv.appendChild(newMessage);
	};
});
