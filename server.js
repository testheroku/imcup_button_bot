const express = require('express'),
    url = require("url"),
    bodyParser = require('body-parser'),
    Ethereum = require('./ethereum.js'),
    Bitcoin = require('./bitcoin.js'),
    db = require('./db.js'),
    nt = require('./nt.js');


const app = express();

// Чтоб считывать статические файлы
app.use(bodyParser.urlencoded({
    extended: false
}))

// Голосуем
app.post('/voteForProposal', (req, res) => {
    var data = req.body;
    var vote;
    if (data.proposalID == "true") {
        vote = true;
    } else {
        vote = false;
    }

    Ethereum.voteForProposal(data.prvtKey, data.proposalID, vote, (data) => {
        res.send(data);
    })
});

// Отправляем уведомление, когда создаётся голосование
app.post('/createVoteAndSendNot', (req, res) => {
    var data = req.body;
    nt.sendNtWhenCreateProposal(data.approvalUsers, data.name, data.sum, data.address, data.why);
    Ethereum.addVote(data.why, data.sum, (data) => {
        res.send(data);
    })
});

// Создаём секретный ключ эфира
app.post('/createEthAccount', (req, res) => {
    var account = Ethereum.createNewAccount();
    res.send(account);
});

// Получаем адрес из секретного ключа эфира
app.post('/getAddress', (req, res) => {
    var data = req.body;
    console.log(data)
    var address = Ethereum.getAddress(data.prvtKey);
    res.send(address);
});

// Получаем баланс эфира
app.post('/getBalance', (req, res) => {
    var data = req.body;
    console.log(data)
    var address = Ethereum.getBalance(data.address, (balance) => {
        console.log(balance)
        res.send(balance.toString());
    });
});

// Отправляем транзакцию в блокчейн эфира
app.post('/sendTx', (req, res) => {
    var data = req.body;
    console.log(data);
    var status = Ethereum.sendTx(data.prvtKey, data.sender, data.receiver, data.amount, (status) => {
        if (status != false) {
            res.send(status);
        } else {
            res.send("400");
        }
    });
});

// Создаём секретный ключ биткоина
app.post('/createBtcAccount', (req, res) => {
    var data = req.body;
    console.log(data);
    var prvtKey = Bitcoin.createNewAccount();
    res.send(prvtKey);
});

// Получаем адрес из секретного ключа биткоина
app.post('/getBtcAddress', (req, res) => {
    var data = req.body;
    console.log(data)
    var address = Bitcoin.getAddress(data.prvtKey);
    res.send(address);
});

// Отправляем транзакцию в блокчейн биткоина
app.post('/sendBtcTx', (req, res) => {
    var data = req.body;
    console.log(data);
    Bitcoin.sendTx(data.prvtKey, data.sender, data.receiver, data.amount);
    res.send('200');
});

// Отправляем уведомление
app.post('/sendNot', (req, res) => {
    var data = req.body;
    console.log(data)
    nt.sendNot(data.userID, data.text);
    res.send('200');
});

app.listen(3000);