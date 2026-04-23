// models.js


export class GameObject {
  constructor(id, name, description) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.parent = null;
  }

  examine() {
    return this.description;
  }
}

export class Container extends GameObject {
  constructor(id, name, description) {
    super(id, name, description);
    this.contents = [];
  }

  addChild(obj) {
    this.contents.push(obj);
    obj.parent = this;
  }

  removeChild(obj) {
    this.contents = this.contents.filter(o => o !== obj);
    obj.parent = null;
  }

  getChildById(id) {
    return this.contents.find(o => o.id === id);
  }

  getContents() { 
    return this.contents;
  }
}

export class Room extends Container {
  constructor(id, name, description, requiresItem = null) {
    super(id, name, description);
    this.exits = {};
    this.requiresItem = requiresItem;
  }

  setExit(direction, room) {
    this.exits[direction] = room;
  }

  getExit(direction) {
    return this.exits[direction];
  }
  /**
   * add: player can enter or not
   */
  canEnter(player) {
    if (!this.requiresItem) return true;
    return player.hasItem(this.requiresItem);
  }
}

export class Item extends GameObject {

  constructor(id, name, description, config = {}) { 
    super(id, name, description);
    this.requiresItem = config.requiresItem || null; 
    this.isLocked = config.isLocked === true;     
    this.contents = config.contents || [];
  }

  take(world) {
    if (this.parent !== world.currentRoom) { 
      world.currentMessage = "You can't take that.";
      return;
    }

    world.currentRoom.removeChild(this);
    world.player.addChild(this);
    world.currentMessage = `You picked up ${this.name}.`;
  }

  drop(world) {
    if (this.parent !== world.player) { 
      world.currentMessage = "You can't drop that.";
      return;
    }

    world.player.removeChild(this);
    world.currentRoom.addChild(this);

    world.currentMessage = `You dropped ${this.name}.`;
  }

  /**
   * add: try to open the lock
   */
  unlock(world) {

  if (!this.isLocked) {
    world.currentMessage = `${this.name} is already open.`;
    return;
  }

  if (this.requiresItem === null || world.player.hasItem(this.requiresItem)) {
    this.isLocked = false;

    this.contents.forEach(childId => {
      const hiddenObj = world.allObjects[childId]; 
      if (hiddenObj) world.currentRoom.addChild(hiddenObj);
    });

    world.currentMessage = `You opened the ${this.name}! Something fell out.`;
  } else {

    const reqItem = world.items.get(this.requiresItem);
    const displayName = reqItem ? reqItem.name : this.requiresItem;
    
    world.currentMessage = `You cannot open the ${this.name}! You need the ${displayName}.`;
  }
}

  getActions(world) { 
    const actions = ["examine"];

    
    if (this.isLocked) {
      actions.push("unlock");
    }

    if (this.parent === world.currentRoom && !this.isLocked) {
      actions.push("take");
    }

    if (this.parent === world.player) {
      actions.push("drop");
    }

    return actions;
  }
}


export class Player extends Container {

  hasItem(itemId) {
    return this.contents.some(item => item.id === itemId);
  }

  inventoryDescription() {
    if (this.contents.length === 0) {
      return "nothing";
    }

    return this.contents.map(item => item.name).join(", ");
  }
}