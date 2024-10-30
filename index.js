const express = require('express');

const fs = require('fs');
const path = require('path');


const joi = require('joi');


const app = express();
//===saveFile
const usersFilePath = path.join(__dirname, 'users.json');


let uniqueID = 0;

// Joi scheme
const userScheme = joi.object({
    first_name: joi.string().min(1).required(),
    second_name: joi.string().min(1).required(),
    Age: joi.number().min(0).required(),
    City: joi.string().min(1)
});

app.use(express.json());

// Helper functions
const readUsersFromFile = () => {
    try {
        const data = fs.readFileSync(usersFilePath, 'utf8'); // utf прописано для русского
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

const writeUsersToFile = (users) => {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
};

app.get('/users', (req, res) => {
    const users = readUsersFromFile();
    res.send({ users });
});

app.get('/users/:id', (req, res) => {
    const userId = +req.params.id;
    const users = readUsersFromFile();
    const user = users.find(user => user.id === userId);
    if (user) {
        res.send({ user });
    } else {
        res.status(404).send({ user: null });
    }
});

app.post('/users', (req, res) => {
    const result = userScheme.validate(req.body);
    if (result.error) {
        return res.status(400).send({ error: result.error.details });
    }

    const users = readUsersFromFile();
    uniqueID = users.length ? users[users.length - 1].id + 1 : 1; // Уникальный ID на основе последнего элемента

    const newUser = { id: uniqueID, ...req.body };
    users.push(newUser);
    writeUsersToFile(users);

    res.send({ id: uniqueID });
});

app.put('/users/:id', (req, res) => {
    const result = userScheme.validate(req.body);
    if (result.error) {
        return res.status(400).send({ error: result.error.details });
    }

    const userId = +req.params.id;
    const users = readUsersFromFile();
    const user = users.find(user => user.id === userId);
    if (user) {
        Object.assign(user, req.body);
        writeUsersToFile(users);
        res.send({ user });
    } else {
        res.status(404).send({ user: null });
    }
});

app.delete('/users/:id', (req, res) => {
    const userId = +req.params.id;
    const users = readUsersFromFile();
    const userIndex = users.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
        const [deletedUser] = users.splice(userIndex, 1);
        writeUsersToFile(users);
        res.send({ user: deletedUser });
    } else {
        res.status(404).send({ user: null });
    }
});

app.listen(3000, () => {
    console.log('стартуем на 3000');
});