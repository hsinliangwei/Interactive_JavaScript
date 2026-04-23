// main.js
import { Room, Item, Player } from "./models.js";

let world = {
  rooms: new Map(),
  items: new Map(),
  player: null,
  currentRoom: null,
  currentMessage: ""
};

const roomNameEl = document.querySelector("#room-name");
const roomDescEl = document.querySelector("#room-desc");
const exitsAreaEl = document.querySelector("#exits-area");
const itemsAreaEl = document.querySelector("#items-area");
const inventoryAreaEl = document.querySelector("#inventory-area");
const messageAreaEl = document.querySelector("#message-area");



fetch("db.json")
  .then(res => res.json())
  .then(data => {
    buildWorld(data);
    render();
  });

function buildWorld(data) {

  world.allObjects = {};
  // Rooms
  for (let id in data.rooms) {
    const r = data.rooms[id];
    const room = new Room(id, r.name, r.description, r.requiresItem);
    world.rooms.set(id, room);
  }
  

  // Items
  for (let id in data.items) {
    const i = data.items[id];
    const item = new Item(id, i.name, i.description, i);
    world.items.set(id, item);
    world.allObjects[id] = item;
  }

  // Step B: relationships
  for (let id in data.rooms) {
    const r = data.rooms[id];
    const room = world.rooms.get(id);

    r.items.forEach(itemId => {
      const item = world.items.get(itemId);
      room.addChild(item);
    });

    for (let dir in r.exits) {
      const target = world.rooms.get(r.exits[dir]);
      room.setExit(dir, target);
    }
  }

  // Player
  world.player = new Player("player", "Player", "It's you");
  const firstRoomId = Object.keys(data.rooms)[0];
  world.currentRoom = world.rooms.get(firstRoomId);

  
}

function render() {
  renderRoom(world.currentRoom);
  renderExits(world.currentRoom);
  renderItems(world.currentRoom);
  renderInventory();
  
 
  if (messageAreaEl) {
    messageAreaEl.textContent = world.currentMessage;
  }
}

function renderRoom(room) {
  roomNameEl.textContent = room.name;
  roomDescEl.textContent = room.description;
}

function renderExits(room) {
  const exits = room.exits;

  let html = "You can go ";

  for (let dir in exits) {
    html += `<button data-direction="${dir}">${dir}</button> to ${exits[dir].name} `;
  }

  exitsAreaEl.innerHTML = `<p>${html}</p>`;

  exitsAreaEl.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => move(btn.dataset.direction));
  });
}

function renderItems(room) {
  const items = room.getContents();

  if (items.length === 0) {
    itemsAreaEl.innerHTML = "<p>You see nothing here.</p>";
    return;
  }

  let html = "";

  items.forEach(item => {
    const actions = item.getActions(world);

    html += `<div>${item.name} `;

    actions.forEach(action => {
      html += `
        <button data-action="${action}" data-id="${item.id}">
          ${action}
        </button>
      `;
    });

    html += `</div>`;
  });

  itemsAreaEl.innerHTML = html;
}

function renderInventory() {
  const items = world.player.getContents();

  if (items.length === 0) {
    inventoryAreaEl.innerHTML = "<p>You are carrying: nothing.</p>";
    return;
  }

  let html = "";

  items.forEach(item => {
    const actions = item.getActions(world);

    html += `<div>${item.name} `;

    actions.forEach(action => {
      html += `
        <button data-action="${action}" data-id="${item.id}">
          ${action}
        </button>
      `;
    });

    html += `</div>`;
  });

  inventoryAreaEl.innerHTML = html;
}



function move(direction) {
  const nextRoom = world.currentRoom.getExit(direction);

  if (!nextRoom) return;

  if (nextRoom.canEnter(world.player)) {
    world.currentRoom = nextRoom;
    world.currentMessage = `You moved ${direction} to ${nextRoom.name}.`;
  } else {
    world.currentMessage = `The door to ${nextRoom.name} is locked. You need the ${nextRoom.requiresItem}!`;
  }
  
  render();
}


function findItemById(id) {
  return (
    world.currentRoom.getChildById(id) ||
    world.player.getChildById(id)
  );
}



document.addEventListener("click", function (e) {
  const action = e.target.dataset.action;
  const id = e.target.dataset.id;

  if (!action) return;

  const item = findItemById(id);
  if (!item) {
    console.error("Item not found:", id);
    return;
  }



  switch (action) {
    case "examine":
      world.currentMessage = item.examine();
      break;
    case "take":
      item.take(world); 
      console.log("Take executed. Current Message:", world.currentMessage); // 這裡檢查訊息是否有變
      break;
    case "drop":
      item.drop(world);
      break;
    case "unlock":
      item.unlock(world);
      break;
    default:
      return; 
  }

  render(); 
});

roomNameEl.addEventListener("click", () => {
  world.currentMessage = world.currentRoom.examine();
  render();
});