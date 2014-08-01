var setX = function($this, x) {
  var translate3d = 'translate3d(' + x + 'px, 0, 0)';
  $this.css({
    transform: translate3d,
    oTransform: translate3d,
    msTransform: translate3d,
    mozTransform: translate3d,
    webkitTransform: translate3d + " scale3d(1,1,1)"
  });
};

var setY = function(height) {
  var _setIt = function() {
    var translate3d = 'translate3d(0, ' + height + 'px, 0)';
    $(document.body).css({
      transform: translate3d,
      oTransform: translate3d,
      msTransform: translate3d,
      mozTransform: translate3d,
      webkitTransform: translate3d + " scale3d(1,1,1)"
    });
  };

  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(_setIt);
  } else {
    _setIt();
  }
};

var App = Em.Application.create({
  VERSION: '0.0.1',
  LOG_TRANSITIONS: false,
  ready: function() {   
    $(".loader").removeClass("show");   
  }
});

App.Me = Em.Object.extend({
  team: localStorage.getItem('WIE_myTeam'),
  dude: localStorage.getItem('WIE_myDude'),

  updateTeamOnLocalStorage: function() {
    localStorage.setItem('WIE_myTeam', this.get('team'));
  }.observes('team'),

  updateDudeOnLocalStorage: function() {
    localStorage.setItem('WIE_myDude', this.get('dude'));
  }.observes('dude')
});

App.me = new App.Me;

App.LoaderComponent = Ember.Component.extend({
  classNames: ['wait-loader'],
  template: "<img src='/ajax-loader.gif'>"
})

var getSocketAddress = function() {
  var hostname = window.location.hostname;
  var protocol = window.location.protocol;
  var port = (protocol === "http:") ? "8000" : "8443";
  var port = (hostname === "localhost") ? "8080" : port;
  return protocol + "//" + hostname + ":" + port;
};

App.Socket = io.connect(getSocketAddress());
App.Socket.on('userStatusChange', function(data) {
  console.log("got data: ", data);
  App.Dude.store.find("dude", data.id).then(function(dude) {
    dude.setProperties({ here: data.here, why: data.why });
  });
});

App.Socket.on('resetAll', function(data) {
  console.log('reseting...');
  App.Dude.store.find("dude").then(function(dudes) {
    dudes.forEach(function(dude) {
      dude.set('here', false);
    });
  });
});

App.ApplicationView = Ember.View.extend({
  gestures: {
    release: function(ev) {
      if (!this.get('isDown')) {
        return;
      }

      ev.preventDefault();
      ev.gesture.preventDefault();

      setY(0);
      this.set('isDown', false);
      if (!this.get('willRefresh')) return;

      this.trigger('refreshDudes');

      this.set('willRefresh', false);
    },

    dragDown: function(ev) {
      if (window.scrollY > 0) return true;

      ev.preventDefault();
      ev.gesture.preventDefault();

      var height = ev.gesture.deltaY * 0.4;
      this.set('isDown', height > 0);
      this.set('willRefresh', height > 60);

      setY(height);
    },
  },

  shouldRefreshDudes: function() {
    this.controller.store.find('dude');
    
    // Reconnect this fucker
    if (!App.Socket.connected) {
      App.Socket.socket.connect();
    }
  }.on('refreshDudes')
});

/*
App.ApplicationView = Ember.View.extend({
  gestures: {
    dragLeft: function(event) {
      event.preventDefault();
      event.gesture.preventDefault();
      return false;
    },
    dragRight: function(event) {
      event.preventDefault();
      event.gesture.preventDefault();
      return false;
    }
  }
});
*/

App.ViewSingleDudeView = Ember.View.extend({
  tagName: 'li',
  templateName: 'view-single-dude',
  classNames: ['dude-list'],
  classNameBindings: ['dude.isMe'],
  whoBinding: 'view.dude',
  nameBinding: 'dude.name',
  isEditingBinding: 'dude.isEditing',
  lastUpdatedBinding: 'dude.lastUpdated',
  whyOrHereBinding: 'who.whyOrHere',

  gestures: {
    doubleTap: function(event) {
      event.gesture.preventDefault();
      event.preventDefault();

      this.set('dude.isEditing', true);
    },

    dragRight: function (event) {
      event.preventDefault();
      event.gesture.preventDefault();
      var width = this.$().width();

      var dragOffset = ((200/width) * event.gesture.deltaX);

      if (dragOffset > 50) {
        this.set('showItsMe', true);
      } else {
        this.set('showItsMe', false);
      }

      setX(this.$(), dragOffset);

      // do something like send an event down the controller/route chain
      return false; // return `false` to stop bubbling
    },
    swipeRight: function(event) {
      this.set('showItsMe', true);
    },
    release: function(event) {
      setX(this.$(), 0);
      if (this.get('showItsMe')) {
        App.set('me.dude', this.get('dude.id'));
        App.set('me.team', this.get('dude.team'));
        window.scrollTo(0,0);
        this.set('showItsMe', false);
      }
    }
  }
});

Ember.Handlebars.helper('view-single-dude', App.ViewSingleDudeView);

App.EditWhyComponent = Ember.Component.extend({
  bufferedWhyBinding: Ember.Binding.oneWay('who.why'),
  didInsertElement: function() {
    var $textfield = this.$(".edit-text-input");
    $textfield.focus();
    $textfield.val($textfield.val());
  },

  actions: {
    cancelEditing: function() {
      this.set('bufferedWhy', this.get('who.why'));
      this.set('who.isEditing', false);
    },
    saveWhy: function() {
      var who = this.get('who');
      var why = this.get('bufferedWhy').trim();
      
      
      if (who.get('why') === why) {
        who.set('isEditing', false);
      } else {
        if (why === '') {
          why = 'לא נוכח';
        }
        who.set('why', why);
        who.set('here', false);
        who.save().then(function() {
          who.set('isEditing', false);
        });
      }
    }
  }
});

App.ReportController = Em.ArrayController.extend({
  matzal: function() {
    return this.get('model.length');
  }.property('model'),

  matzan: function() {
    return this.get('model').filter(function(dude) {
      return dude.get('here');
    }).length;
  }.property('model.@each.here'),

  missing: function() {
    return this.get('model').filter(function(dude) {
      return !dude.get('here');
    }).length;
  }.property('model.@each.here'),

  missingDudes: function() {
    return this.get('model').filter(function(dude) {
      return !dude.get('here');
    }).sortBy('team')
  }.property('model.@each.here'),

  formattedTime: function() {
    var time = this.get('currentTime');

    var formatted = moment(time).format("DD/MM/YYYY hh:mm:ss");

    return formatted;
  }.property('currentTime')
});

App.ReportDudeView = Em.View.extend({
  tagName: 'li',
  templateName: 'report-dude',
  classNames: ['dude-list'],
  classNameBindings: ['aboutToDelete'],

  teamBinding: 'who.team',
  nameBinding: 'who.name',
  whyBinding: 'who.why',

  hammerOptions: {
    swipe_velocity: 0.6
  },

  gestures: {
    dragRight: function (event) {
      event.preventDefault();
      event.gesture.preventDefault();
      var width = this.$().width();

      var dragOffset = ((200/width) * event.gesture.deltaX);

      if (dragOffset > 80) {
        this.set('aboutToDelete', true);
      } else {
        this.set('aboutToDelete', false);
      }

      setX(this.$(), dragOffset);

      // do something like send an event down the controller/route chain
      return false; // return `false` to stop bubbling
    },
    swipeRight: function(event) {
      this.set('aboutToDelete', true);
    },
    release: function(event) {
      if (!this.get('aboutToDelete')) {
        setX(this.$(), 0);
      } else {
        this.set('who.here', true);
        this.get('who').save();
      }
    }
  }
});

Ember.Handlebars.helper("report-dude", App.ReportDudeView);

App.ReportRoute = Em.Route.extend({
  setupController: function(controller, model) {
    controller.set('currentTime', new Date());
    controller.set('model', model);
  },
  
  model: function() {
    return this.store.find('dude');
  }
});


// For showing nice thumbs up or down
App.DudeHereView = Ember.View.extend({
  tagName: 'span',
  classNameBindings: ['dude.isHere:in-matzeva', 'isHere:fa-thumbs-up', 'isNotHere:fa-thumbs-down', 'isLoading:fa-spinner', 'isLoading:fa-spin'],
  classNames: ['is-in-matzeva'],

  isLoading: function() {
    return this.get('dude.isSaving');
  }.property('dude.isLoading'),

  isHere: function() {
    return !this.get('isLoading') && this.get('dude.isHere');
  }.property('isLoading', 'dude.isHere'),

  isNotHere: function() {
    return !this.get('isLoading') && !this.get('dude.isHere');
  }.property('isLoading', 'dude.isHere'),

  toggleHere: function() {
    this.get('dude').toggleHere().save();
  },

  gestures: {
    tap: function() {
      this.toggleHere();
    }
  }
});

Ember.Handlebars.helper('dude-here', App.DudeHereView);

App.ApplicationAdapter = DS.RESTAdapter.extend({
  namespace: 'api'
});

App.DudeAdapter = App.ApplicationAdapter.extend({
  updateRecord: function(store, type, record) {
    App.Socket.emit('userStatusChange', {
      _id: record.get('id'),
      here: record.get('here'),
      why: record.get('why')
    });

    console.log("emitted new data to server.");

    return Ember.RSVP.resolve();
  }
});

App.Store = DS.Store.extend({
  revision: 12,
});

App.Dude = DS.Model.extend({
  team: DS.attr('string'),
  name: DS.attr('string'),
  why: DS.attr('string', { defaultValue: "לא נוכח" }),
  here: DS.attr('boolean', { defaultValue: false }),
  isMe: function() {
    return App.get('me.dude') === this.get('id');
  }.property('App.me.dude'),
  isHere: function() {
    return this.get('here');
  }.property('here'),
  whyOrHere: function() {
    var why = this.get('why').trim() === "" ? "לא נוכח" : this.get('why');
    return this.get('here') ? "נוכח" : why;
  }.property('here', 'why'),
  toggleHere: function() {
    this.set('here', !this.get('here'));
    return this;
  }
});

  // var isHereClasses = !this.get("here") ? " fa-thumbs-down" : " in-matzeva fa-thumbs-up";
  // return new Ember.Handlebars.SafeString("<span class=\"is-in-matzeva" + isHereClasses + "\"></span>");
// });

App.Router.map(function() {
  this.route("report", { path: "/report" });
  this.route("update", { path: "/update" });
  this.route("reset", { path: "/reset" });
});

App.ResetRoute = Ember.Route.extend({
  actions: {
    reset: function() {
      console.log('emitting resetAll function to the server');
      App.Socket.emit('resetAll', true);
      this.transitionTo('update');
    },
    goBack: function() {
      this.transitionTo('update');
    }
  }
});

App.IndexRoute = Em.Route.extend({
  beforeModel: function() {
    this.transitionTo("update");
  }
});

App.UpdateController = Em.ArrayController.extend({
  teams: function() {
    var teams = {'הנגשת המידע': [],'אפליקטיבי 1': [],'אפליקטיבי 2': [],'GIS': []};
    var myTeam = null;

    this.get('model').forEach(function(dude) {
      var team = dude.get('team');
      teams[dude.get('team').toString()] = teams[dude.get('team').toString()] || [];
      if (dude.get('id') !== App.get('me.dude')) {
        teams[dude.get('team').toString()].push(dude);
      } else {
        myTeam = dude.get('team');
        teams[dude.get('team').toString()].insertAt(0, dude);
      }
    });


    var teamsArray = (function(selectedTeam) {
      var arr = [];

      var teamsKeys = Object.keys(teams);
      for (var i = 0; i < teamsKeys.length; i++) {
        var team = teamsKeys[i];
        var whatToPush = { team: team, members: teams[team] };

        if (team != selectedTeam) {
          arr.push(whatToPush);
        } else {
          arr.insertAt(0, whatToPush);
        }
      }

      return arr;
    })(myTeam);

    return teamsArray;
  }.property('model', 'App.me.dude')
});

App.UpdateRoute = Em.Route.extend({
  model: function() {
    return this.store.find('dude');
  },
  actions: {
    editWhy: function(dude) {
      dude.set('isEditing', true);
    }
  }
});