var word;
var type;
var first_field;
var questions = 0;
var right = 0;
var json = {};
hidden_text = "hidden"

function checkAnswer(element, key, value) {
	if (element.value === value) {
		element.style.backgroundColor = "lime";
		focusNext();
	} else {
		element.style.backgroundColor = "red";
	}
}

function pickWord() {
	if (type === "article") {
		word = json;
	}
	else {
		let chosen_groups = [];
		let groups_nums = [];
		let elements = document.getElementsByClassName("groups");

		for(let index=0; index < elements.length; index++){
			groups_nums = groups_nums.concat(elements[index].id);
		}

		for (num of groups_nums) {
			if (document.getElementById(num).checked) {
				chosen_groups = chosen_groups.concat(json[num]);
			}
		}

		let random_int = Math.floor(Math.random() * chosen_groups.length);
		word = chosen_groups[random_int];
		if (document.getElementById("minim").checked) {
			document.getElementById("word").textContent = word["word"];
		} else {
			document.getElementById("word").textContent = word["word_more"];
		}
	}

	for (const [key, value] of Object.entries(word["forms"])) {
		let element = document.getElementById(key);
		element.addEventListener("keyup", function(){checkAnswer(element, key, value)});
	}
}

async function init(url, passed_type, passed_first_field) {
	if (passed_type === "lat_noun") {
		const res = await fetch("https://files.catbox.moe/pi8g0m.json");
		const orders = await res.json();

		const section = document.getElementById("section");
		const column = document.getElementById("column");
		const header = document.getElementById("header");
		const conj_decl = document.getElementById("conj_decl");
		for (const number of orders["lat_noun"]["numbers"]) {
			let column_clone = column.content.cloneNode(true);
			first = 1;
			for (const form of orders["lat_noun"]["orders"]["Traditional"]) {
				if (first === 1) {
					let header_clone = header.content.cloneNode(true);
					column_clone.appendChild(header_clone)
					first = 0;
				}
				console.log(number, form);
				let conj_decl_clone = conj_decl.content.cloneNode(true);
				column_clone.appendChild(conj_decl_clone);
			}
			section.appendChild(column);
		}
	}
	if (Object.keys(json).length === 0) {
		const res = await fetch(url);
		json = await res.json();
	}
	type = passed_type;
	first_field = passed_first_field;
	pickWord();
}

function nextWord() {
	pickWord();
	for (const [key, value] of Object.entries(word["forms"])) {
		document.getElementById(key).style.backgroundColor = "white";
		document.getElementById(key).value = "";

		if (type != "noun_sga") {
			document.getElementById(key + "_cor").innerHTML = "<i>" + hidden_text + "</i>";
		}
		else {
			let cases = ["nom", "acc", "gen", "dat", "voc"];
			let numbers = ["s", "p", "d"];
			for (a_case of cases) {
				for (number of numbers) {
					document.getElementById(number + "_" + a_case + "_cor").innerHTML = "<i>" + hidden_text + "</i>";
				}
			}
		}
	}
	document.getElementById(first_field).focus();
	return 0;
}