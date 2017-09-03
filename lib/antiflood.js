let userDB = module.exports = function() { // {{{
  if (!(this instanceof userDB)) return new userDB();
  this.store = {};
  this._params = {
    msgTrigger: 5,
    timeTrigger: 5000,
    maxAfkTime: 30*24*60*60*1000
  };
} //}}}

userDB.prototype.addUser = function(userId, groupId) {
  if (!this.store.hasOwnProperty(groupId)) {
    this.store[groupId] = {};
  } 
  this.store[groupId][userId] = user(this._params);
}

userDB.prototype.action = function(userId, groupId) {
  if (this.store[groupId] && this.store[groupId][userId]) {
    checkStatus = this.store[groupId][userId].checkAbuse();
    if (checkStatus) {
      this.deleteUser(userId, groupId);
      return true;
    } else {
      return false;
    }
  } else {
    this.addUser(userId, groupId);
    return false;
  }


}

userDB.prototype.deleteUser = function(userId, groupId) {
  this.store[groupId][userId] = undefined;
}

userDB.prototype.deleteGroup = function(userId, groupId) {
  this.store[groupId] = undefined;
}

userDB.prototype.afkAll = function(cb) {
  for (let g of this.store) {
    for (let u of this.store[g]) {
      if (this.store[g][u].checkAfk) {
        this.deleteUser();
        cd(u, g);
      }
    }
  }
}





let user = function(params) {
  if (!(this instanceof user)) return new user(params);
  if (typeof params !== 'object') params = {};
  // options
  this.msgTrigger = params.msgTrigger || 5; // Number of messages to enable trigger
  this.timeTrigger = params.timeTrigger || 5*1000; // Time (ms) to enable trigger
  this.afkTimeTrigger = params.maxAfkTime || 30*24*60*60*1000; // Maximum afr time
  this.lastTime = Date.now(); // Time of user's last message
  this.messages = [this.lastTime];
  this.isWarned = false;
}
user.prototype.checkAbuse = function() {
  this.lastTime = Date.now();
  if (this.messages.length === this.msgTrigger) {
    if ((this.lastTime - this.messages[1]) <= this.timeTrigger) {
      this.messages = [];
      this.isWarned = true;
      return true;
    } else {
      this.messages = [...this.messages.slice(1), this.lastTime];
      return false;
    }
  } else {
    this.messages.push(this.lastTime);
    return false;
  }
}
user.prototype.checkAfk = function() {
  if (this.lastTime && ((Date.now() - this.lastTime) > this.afkTimeTrigger)) {
    return true;
  } else {
    return false;
  }
}

