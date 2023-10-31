var word;
var type;
var first_field;
var questions = 0;
var right = 0;
var json = {};
var enter = 0;
var element_list = [];
var numbers = [];
var orders = [];
hidden_text = "hidden"

function checkAnswer(element, key, value) {
	if (document.getElementById("imm").checked) {
		if (element.value === value) {
			element.style.backgroundColor = "lime";
			let index = element_list.indexOf(key);
			if (index + 1 < element_list.length) {
				document.getElementById(element_list[index + 1]).focus();
			} else {
				document.getElementById("check").focus();
			}
		} else {
			element.style.backgroundColor = "red";
		}
	} else {
		element.style.backgroundColor = "white";
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

	for (let [key, value] of Object.entries(word["forms"])) {
		let element = document.getElementById(key);
		element.addEventListener("keyup", function(){checkAnswer(element, key, value)});
	}
}

async function init(url, passed_type) {
	document.getElementById("check").addEventListener("click", function(){nextWord()});
	if (passed_type === "lat_noun") {
		const res = await fetch("https://files.catbox.moe/fyzwd4.json");
		const json = await res.json();

		let lang_info = json[passed_type];
		numbers = lang_info["numbers"];
		orders = lang_info["orders"];
		let default_order = lang_info["default"];
		console.log(default_order);
		for (let number of numbers) {
			for (let value of orders[default_order]) {
				element_list.push(number + "_" + value);
			}
		}
	}

	let radios = document.getElementsByName("order");
	for (let radio of radios) {
		radio.addEventListener("change", function(){changeOrder(radio.id)});
	}

	if (Object.keys(json).length === 0) {
		const res = await fetch(url);
		json = await res.json();
	}
	type = passed_type;
	first_field = element_list[0];
	pickWord();
}

function changeOrder(order) {
	console.log(order);
	element_list = [];
	for (let number of numbers) {
		let previous_element = document.getElementById(number + "_header_row");
		for (let value of orders[order]) {
			let current_element_name = number + "_" + value + "_row";
			element_list.push(number + "_" + value);
			let element = document.getElementById(current_element_name);
			previous_element.insertAdjacentElement("afterend", element);
			previous_element = element;
		}
	}
}

function nextWord() {
	if (enter === 0) {
		document.getElementById("check").textContent = "Next";
		let wrong = 0;
		for (let [key, value] of Object.entries(word["forms"])) {
			element = document.getElementById(key);
			if (element.value !== value) {
				wrong = 1;
				element.style.backgroundColor = "red";
			} else {
				element.style.backgroundColor = "lime";
			}
			if (type != "noun_sga") {
				document.getElementById(key + "_cor").textContent = value;
			}
		}
		if (wrong === 0) {
				right += 1;
		}
		questions += 1;
		document.getElementById("results").textContent = right + "/" + questions;
		if (type === "noun_sga") {
			let cases = ["nom", "acc", "gen", "dat", "voc"];
			let numbers = ["s", "p", "d"];
			let answer = "";
			let forms = word["forms"];
				for (a_case of cases) {
					for (number of numbers) {
						if (number === "d" || a_case === "voc") {
							answer = forms[number + "_" + a_case + "_part"] + "<sup>" + forms[number + "_" + a_case + "_part_im"].toUpperCase() + "</sup> " + forms[number + "_" + a_case] + "<sup>" + forms[number + "_" + a_case + "_im"].toUpperCase() + "</sup>";
						}
						else {
							answer = forms[number + "_" + a_case] + "<sup>" + forms[number + "_" + a_case + "_im"].toUpperCase() + "</sup>";
						}
						document.getElementById(number + "_" + a_case + "_cor").innerHTML = answer;
					}
				}
		}
		enter = 1;
	} else {
		document.getElementById("check").textContent = "Reveal";
		pickWord();
		for (let [key, value] of Object.entries(word["forms"])) {
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
		enter = 0;
	}
}