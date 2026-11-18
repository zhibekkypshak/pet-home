
class Pet {
    constructor({ name, type, age, image, page, contactValue, energy, time, experience, space, goodWithKids }) {
        this.name = name;
        this.type = type;
        this.age = age;
        this.image = image;
        this.page = page;
        this.contactValue = contactValue;
        this.energy = energy;
        this.time = time;
        this.experience = experience;
        this.space = space;
        this.goodWithKids = goodWithKids;
    }

    getAgeLabel() {
        return `${this.age} ${this.age === 1 ? "year" : "years"} old`;
    }

    getAdoptLink() {
        return `contact.html?pet=${this.contactValue}`;
    }

    getMatchScore(answers) {
        let score = 0;

        if (this.space === "apartment" || answers.space === "house") {
            score += 25;
        } else {
            score += 5;
        }

        score += Math.max(0, 20 - Math.abs(this.time - answers.time) * 10);

        score += Math.max(0, 25 - Math.abs(this.energy - answers.energy) * 12);

        score += answers.experience >= this.experience ? 15 : 5;

        if (!answers.kids || this.goodWithKids) {
            score += 15;
        }

        return Math.min(100, Math.round(score));
    }

    getMatchReasons(answers) {
        const reasons = [];

        if (this.energy === answers.energy) reasons.push("same activity level as you");
        if (this.space === "apartment") reasons.push("happy in an apartment");
        if (answers.kids && this.goodWithKids) reasons.push("good with children");
        if (this.experience === 1) reasons.push("great for first-time owners");
        if (this.time <= answers.time) reasons.push("fits your free time");

        return reasons;
    }
}

const petData = [
    {
        name: "Max", type: "Dog", age: 2, image: "images/max.jpg", page: "pet-max.html",
        contactValue: "max",
        energy: 3, time: 3, experience: 2, space: "house", goodWithKids: true
    },
    {
        name: "Luna", type: "Cat", age: 3, image: "images/luna.jpg", page: "pet-luna.html",
        contactValue: "luna",
        energy: 1, time: 1, experience: 1, space: "apartment", goodWithKids: true
    },
    {
        name: "Charlie", type: "Dog", age: 1, image: "images/charlie.jpg", page: "pet-charlie.html",
        contactValue: "charlie",
        energy: 3, time: 3, experience: 1, space: "apartment", goodWithKids: true
    },
    {
        name: "Bella", type: "Dog", age: 4, image: "images/bella.jpg", page: "pet-bella.html",
        contactValue: "bella",
        energy: 3, time: 3, experience: 3, space: "house", goodWithKids: false
    },
    {
        name: "Milo", type: "Rabbit", age: 3, image: "images/milo.jpg", page: "pet-milo.html",
        contactValue: "milo",
        energy: 1, time: 1, experience: 1, space: "apartment", goodWithKids: true
    },
    {
        name: "Daisy", type: "Parrot", age: 5, image: "images/daisy.jpg", page: "pet-daisy.html",
        contactValue: "daisy",
        energy: 2, time: 2, experience: 2, space: "apartment", goodWithKids: false
    }
];

const pets = petData.map(data => new Pet(data));
