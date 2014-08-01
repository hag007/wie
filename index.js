var e = require('express')();
var m = require('mongoose');
var dep = {Mongoose: m};

m.connect("mongodb://localhost/wie2_test");

require('./src/models/Dude')(dep);

var data = [
    {"team":"הנגשת המידע" ,"name":"עידן הללי","here":false,"why":"לא נוכח"},
    {"team":"הנגשת המידע" ,"name":"בן-ציוד סויד","here":false,"why":"לא נוכח"},
    {"team":"הנגשת המידע" ,"name":"מתן פרלמוטר","here":false,"why":"לא נוכח"},
     {"team":"הנגשת המידע" ,"name":"איתי אדרי","here":false,"why":"לא נוכח"},
    {"team":"הנגשת המידע" ,"name":"ניב גבאי","here":false,"why":"לא נוכח"},
    {"team":"אפליקטיבי 1" ,"name":"אלי גולדברג","here":false,"why":"לא נוכח"},
    {"team":"אפליקטיבי 1" ,"name":"אלון כץ","here":false,"why":"לא נוכח"},
    {"team":"אפליקטיבי 1" ,"name":"מעין פאעל","here":false,"why":"לא נוכח"},
    {"team":"אפליקטיבי 1" ,"name":"רן דרור","here":false,"why":"לא נוכח"},
    {"team":"אפליקטיבי 1" ,"name":"חגי לוי","here":false,"why":"לא נוכח"},
     {"team":"אפליקטיבי 2" ,"name":"חבר פרבר","here":false,"why":"לא נוכח"},
    {"team":"אפליקטיבי 2","name":"איתי שטיינר","here":false,"why":"לא נוכח"},
    {"team":"אפליקטיבי 2","name":"עמרי כדורי","here":false,"why":"לא נוכח"},
    {"team":"אפליקטיבי 2","name":"הראל גלברג","here":false,"why":"לא נוכח"},
    {"team":"אפליקטיבי 2","name":"שיר אזאצ'י","here":false,"why":"לא נוכח"},
    {"team":"אפליקטיבי 2","name":"גיא סולימה","here":false,"why":"לא נוכח"},
     {"team":"GIS","name":"איתי חיימסקי","here":false,"why":"לא נוכח"},
    {"team":"GIS","name":"ספיר דיגמל","here":false,"why":"לא נוכח"},
    {"team":"GIS","name":"ליטל נסרי","here":false,"why":"לא נוכח"},
    {"team":"GIS","name":"עדיאל גורן","here":false,"why":"לא נוכח"},
    {"team":"GIS","name":"עמרי לוי","here":false,"why":"לא נוכח"}
]
    
    
    
data.forEach(function(dudeData) {
  new m.models.Dude(dudeData).save(function(err, data) {
    console.log(err ? 'error' : 'success');
  });
});