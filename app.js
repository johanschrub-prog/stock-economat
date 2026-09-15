let currentTab = "devant";

let data =
JSON.parse(localStorage.getItem("caveData")) || {
    devant: [],
    champagne: [],
    alcool: []
};

function save() {
    localStorage.setItem(
        "caveData",
        JSON.stringify(data)
    );
}

function changeTab(tab, button) {

    currentTab = tab;

    document
        .querySelectorAll(".tab")
        .forEach(t => t.classList.remove("active"));

    button.classList.add("active");

    render();
}

function render() {

    const recherche =
        document.getElementById("search")
        .value
        .toLowerCase();

    let html = "";

    data[currentTab]
    .filter(item =>
        item.article
        .toLowerCase()
        .includes(recherche)
    )
    .forEach((item, index) => {

        html += `
        <div class="card">

            <div class="article">
                ${item.article}
            </div>

            <div>
                Code : ${item.code}
            </div>

            <div class="qty">
                ${item.quantite}
            </div>

            <div class="actions">

                <button class="minus"
                    onclick="updateQty(${index},-1)">
                    -1
                </button>

                <button class="plus"
                    onclick="updateQty(${index},1)">
                    +1
                </button>

                <button class="edit"
                    onclick="editArticle(${index})">
                    Modifier
                </button>

                <button class="delete"
                    onclick="deleteArticle(${index})">
                    Supprimer
                </button>

            </div>

        </div>
        `;

    });

    document.getElementById("cards").innerHTML = html;
}

function updateQty(index, valeur) {

    data[currentTab][index].quantite =
        Math.max(
            0,
            data[currentTab][index].quantite + valeur
        );

    save();
    render();
}

function deleteArticle(index) {

    if (!confirm("Supprimer cet article ?"))
        return;

    data[currentTab].splice(index, 1);

    save();
    render();
}

function addArticle() {

    const code = prompt("Code article");

    if (!code) return;

    const article = prompt("Nom article");

    if (!article) return;

    const quantite =
        parseInt(prompt("Quantité", "0")) || 0;

    data[currentTab].push({
        code,
        article,
        quantite
    });

    save();
    render();
}

function editArticle(index) {

    const article =
        data[currentTab][index];

    article.code =
        prompt(
            "Code",
            article.code
        ) || article.code;

    article.article =
        prompt(
            "Article",
            article.article
        ) || article.article;

    article.quantite =
        parseInt(
            prompt(
                "Quantité",
                article.quantite
            )
        ) || 0;

    save();
    render();
}

function resetStock() {

    if (
        !confirm(
            "Remettre toutes les quantités à zéro ?"
        )
    ) return;

    Object.keys(data).forEach(cat => {

        data[cat].forEach(item => {
            item.quantite = 0;
        });

    });

    save();
    render();
}

render();
