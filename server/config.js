let playerNamesArray = [
    "Galileo",
    "William ",
    "Hans",
    "Johannes",
    "John",
    "Willebrord",
    "Nicolaus",
    "William",
    "Rene",
    "Blaise",
    "Thomas",
    "Christiaan",
    "Pierre",
    "Jan",
    "Otto",
    "Robert",
    "Robert",
    "James",
    "Leonardo",
    "Isaac",
    "John",
    "Hennig",
    "Antony",
    "Christiann",
    "Gottfried",
    "Leonardo",
    "Leonhard",
    "Louis",
    "Marie",
    "Albert",
    "Jane",
    "Maria",
    "Rachel",
    "Rosalind",
    "Barbara",
    "Gertrude",
    "Elizabeth",
    "Joy",
    "Maria",
    "Mary",
    "Virginia",
    "Elizabeth",
    "Clara",
    "Florence",
    "Ruth",
    "Elizabeth"
]

let playerLastNamesArray = [
    "Galilei ",
    "Gilbert",
    "Lippershey",
    "Kepler",
    "Napier",
    "Snell",
    "Cabeus",
    "Oughtred",
    "Descartes",
    "Pascal",
    "Bartholin",
    "Huygens",
    "de Fermat",
    "Swammerdam",
    "von Guericke",
    "Hooke",
    "Boyle",
    "Gregory",
    "Da Vinci",
    "Newton",
    "Wallis",
    "Brand",
    "van Leeuwenhoek",
    "Huygens",
    "Leibniz",
    "Fibonacci",
    "Euler",
    "Pasteur",
    "Curie",
    "Einstein",
    "Goodall",
    "Mayer",
    "Carson",
    "Franklin",
    "Mcclintock",
    "Elion",
    "Blackwell",
    "Adamson",
    "Agnesi",
    "Anning",
    "Apgar",
    "Arden",
    "Barton",
    "Bascom",
    "Benedict",
    "Britton"
];

exports.menuTemplate = [{
    label: 'File',
    submenu: [{
        label: 'New',
        accelerator: 'Ctrl + N',
        click: () => {
            console.log('About Clicked');
        }
    }, {
        label: 'Close',
        accelerator: 'Ctrl + Q',
        click: () => {
            // app.quit();
            mainWindow.close();
        }
    }]
}, {
    label: 'View',
    submenu: [{
        label: 'Plus Petit',
        accelerator: 'Ctrl + 1',
        click: () => {
            windowSmaller()
        }
    }, {
        label: 'Petit',
        accelerator: 'Ctrl + 2',
        click: () => {
            windowSmall()
        }
    }, {
        label: 'Normal',
        accelerator: 'Ctrl + 3',
        click: () => {
            windowRegular()
        }
    }, {
        label: 'Grand',
        accelerator: 'Ctrl + 4',
        click: () => {
            windowsBig()
        }
    }]
}];

exports.getRandomName = function() {
    let randomIndex = Math.floor(Math.random() * playerNamesArray.length);
    let name = playerNamesArray[randomIndex];
    randomIndex = Math.floor(Math.random() * playerLastNamesArray.length);
    let lastName = playerLastNamesArray[randomIndex];
    return `${name} ${lastName}`;
}