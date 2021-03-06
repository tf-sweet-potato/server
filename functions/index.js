const functions = require('firebase-functions');
const admin = require('firebase-admin');
var serviceAccount = require("./sweetpotatoserver-firebase-adminsdk-38tyz-424bf9e1a8.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://sweetpotatoserver.firebaseio.com/"
});
const firebase = require('firebase');
firebase.initializeApp(functions.config().firebase);

//GWの詳細情報取得
exports.info = functions.https.onRequest((req, res) => {
  if(req.method != 'GET'){
    res.status(404).json({ message: 'Not Found' });
    return;
  }
  const uid = req.query.uid;
  admin.database().ref('/gw/'+uid+'/info').once("value", function(data) {
      console.log("data",data);
      res.status(200).json(data.val());
  });
});

//ユーザー情報でログイン
exports.signin = functions.https.onRequest((req, res) => {
  if(req.method != 'POST'){
    res.status(404).json({ message: 'Not Found' });
    return;
  }

  const email = req.body.email;
  const password = req.body.password;
  //console.log("query",req.query);
  //console.log("body",req.body);

  admin.auth().getUserByEmail(email)
    .then(function(userRecord) {
      // See the UserRecord reference doc for the contents of userRecord.
      console.log("Successfully fetched user data:", userRecord.toJSON());

      firebase.auth().signInWithEmailAndPassword(email, password)
        .then(function(customToken) {
          const user = firebase.auth().currentUser;
          console.log(user);
          const uid = user.uid;
          const email = user.email;
          admin.auth().createCustomToken(uid)
            .then(function(customToken) {
              // Send token back to client
              res.status(200).json({"status":"OK","uid":uid,"email":email,"custom_token":customToken});
            })
            .catch(function(error) {
              const errorCode = error.code;
              const errorMessage = error.message;
              console.log("Error creating custom token:", error);
              res.status(400).json({"status":"NG","errorCode":errorCode,"errorMessage":errorMessage});
            });
        })
        .catch(function(error) {
            const errorCode = error.code;
            const errorMessage = error.message;
            res.status(400).json({"status":"NG","errorCode":errorCode,"errorMessage":errorMessage});
        });
    })
    .catch(function(error) {
      console.log("Error fetching user data:", error);
      res.status(400).json({"status":"NG","errorCode":errorCode,"errorMessage":errorMessage});
    });
});

//GWからの beacon情報 POST
exports.gw = functions.https.onRequest((req, res) => {
  if(req.method != 'POST'){
    res.status(404).json({ message: 'Not Found' });
    return;
  }

  const uid = req.query.uid;
  const be = req.query.be;

  //console.log("gw");
  //console.log(" uid", uid);
  //console.log(" be", be);
  //console.log(" body", req.body);

  //TODO 本来は customToken でログインしてユーザーとしてDBに記録する
  for(let i in req.body){
    var data = req.body[i];
    //データ受信日時 msec を追加
    data["create_date"] = (new Date()).getTime();
    console.log("data", data);

    admin.database().ref('/gw/'+uid+'/device/'+be).push(data).then(snapshot => {
      res.status(200).json({"status":"OK"});
    });
  }
});

//gw 登録
exports.register = functions.https.onRequest((req, res) => {
  if(req.method != 'POST'){
    res.status(404).json({ message: 'Not Found' });
    return;
  }

  //カスタムトークン と gw ユニークキー
  const customToken = req.query.customToken;
  const uid = req.query.uid;

  admin.auth().verifyIdToken(customToken)
    .then(function(decodedToken) {
      var uid = decodedToken.uid;
      //GW 所持者の uidを登録する
      //TODO 既に登録されている場合はエラーとする
      const info = {"user":{"uid":decodedToken.uid}};
      admin.database().ref('/gw/'+uid+'/info').set().then(snapshot => {
        res.status(200).json({"status":"OK"});
      });
    }).catch(function(error) {
      res.status(404).json({ message: 'Not Found' });
    });
}
