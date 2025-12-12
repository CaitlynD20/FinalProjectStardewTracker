const URL = "https://lwtqoavss1.execute-api.us-east-2.amazonaws.com/bundles";

let collectedItems = [];

const bundleSelect = document.getElementById("bundle-select");
const itemsContainer = document.getElementById("items");
const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");

function save(bundleId, collected) {
    const progress = JSON.parse(localStorage.getItem("bundleProgress")) || {};
    progress[bundleId] = collected;
    localStorage.setItem("bundleProgress", JSON.stringify(progress));
}

function load(bundleId) {
    const progress = JSON.parse(localStorage.getItem("bundleProgress")) || {};
    return progress[bundleId] || [];
}

async function loadBundle(bundleId) {
    try {
        const response = await fetch(`${URL}?bundleId=${bundleId}`);
        const items = await response.json();
        collectedItems = load(bundleId);
        renderItems(items, bundleId);
    } catch (error) {
        console.error(error);
        itemsContainer.innerHTML = "<p>Failed to load bundle data.</p>";
    }
}

function renderItems(items, bundleId) {
    itemsContainer.innerHTML = "";

    items.forEach(item => {
        const div = document.createElement("div");
        div.className = "item-card";

        const isChecked = collectedItems.includes(item.itemId);

        div.innerHTML = `
            <img src="${item.imageUrl}" alt="${item.itemName}">
            <p>${item.itemName}</p>
            <p>Count: ${item.required}</p>
            ${item.season ? `<p>Season: ${item.season.join(", ")}</p>` : ""}
            ${item.locations ? `<p>Location: ${item.locations.join(", ")}</p>` : ""}
            <label>
                <input type="checkbox" data-itemid="${item.itemId}" ${isChecked ? "checked" : ""}>
                Collected
            </label
        `;
        itemsContainer.appendChild(div);
    });
    itemsContainer.querySelectorAll('input[type="checkbox"]').forEach(check => {
        check.addEventListener("change", e => {
            const itemId = e.target.dataset.itemid;
            if (e.target.checked) {
                collectedItems.push(itemId);
            } else {
                collectedItems = collectedItems.filter(id => id !== itemId);
            }
            save(bundleId, collectedItems);
            updateProgress(items.length);
        });
    });
    updateProgress(items.length);
}

function updateProgress(totalItems) {
    const count = collectedItems.length;
    const percent = (count / totalItems) * 100;
    progressBar.style.width = percent + "%";
    progressText.textContent = `${count} / ${totalItems} items collected`;
}

loadBundle(bundleSelect.value);
bundleSelect.addEventListener("change", () => loadBundle(bundleSelect.value));