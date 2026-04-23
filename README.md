# Interactive_JavaScript
JS Advent: Key-like Items & Conditional Actions

Project Overview
This project is an extension of the JS Advent text-adventure game. The core focus is implementing a dynamic interaction system using Object-Oriented Programming (OOP) and the MVC pattern.

The engine now supports "Key-like Items"—objects in the player's inventory that are required to perform specific actions, unlock containers, or access restricted areas.

Key Features
Modular OOP Design: Game logic is encapsulated within classes (Room, Item, Player) to ensure high cohesion.

Key-Interaction System: Implemented two distinct key-target relationships:

Old Key 🔑: Required to unlock the Steel Safe in the kitchen.

Keycard 💳: Required to bypass the Garden Gate in the hallway.

Hidden Content Revelation: Successfully implemented a system where unlocking an object (like the Safe) dynamically injects new items (Secret Note) into the room's environment.

Dynamic UI Feedback: The interface updates in real-time to show valid actions and provides contextual feedback through a dedicated message area.

🛠️ Technical Stack
JavaScript (ES6+): Used classes, inheritance, and asynchronous programming.

JSON: Externalized game data to db.json for a data-driven approach.

Fetch API: Asynchronously loading game worlds.

HTML5/CSS3: Responsive game interface.

Reflection Questions
1. How did you check whether the player has a required item?

I implemented a hasItem(itemId) method within the Player class. This method utilizes the .some() array function to scan the player's internal contents array and return a boolean if an item with a matching ID is found.

2. Where did you place the logic for enabling/disabling actions? Why?

The logic is placed inside the getActions(world) method within the Item class. This ensures Encapsulation; the object itself knows its current state (locked/unlocked) and determines what the player can do with it, rather than having the logic scattered in the controller (main.js).

3. How do your key-like items improve gameplay compared to basic items?

Basic items only offer "Take" and "Examine." Key-like items introduce progression gates and puzzle elements. They force the player to explore, collect specific resources, and revisit areas, creating a much more engaging and rewarding gameplay loop.

4. What design challenges did you encounter when adding conditional behavior?

The primary challenge was managing State Consistency. When an item is unlocked, I had to ensure the newly revealed items were correctly moved from the container's contents to the currentRoom's contents so the UI could render them immediately.

How to Run
Clone the repository.

Open index.html using a local server (e.g., VS Code's Live Server) to avoid CORS issues with db.json.

Explore the house and find the keys!
