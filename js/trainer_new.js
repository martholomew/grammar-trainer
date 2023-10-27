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
		element.nextElementSibling.focus();
	} else {
		element.style.backgroundColor = "red";
	}
}

function pickWord() {
	if (type === "article") {
		word = json;
	}
	else {
		let chosen_conj_decl = [];
		let conj_decl_nums = [];
		let elements = document.getElementsByClassName("conj_decl");

		for(let index=0; index < elements.length; index++){
			conj_decl_nums = conj_decl_nums.concat(elements[index].id);
		}

		for (num of conj_decl_nums) {
			if (document.getElementById(num).checked) {
				chosen_conj_decl = chosen_conj_decl.concat(json[num]);
			}
		}

		let random_int = Math.floor(Math.random() * chosen_conj_decl.length);
		word = chosen_conj_decl[random_int];
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