var word;
var type;
var passed_type;
var first_field;
var questions = 0;
var right = 0;
var json = {};
var enter = 0;
var element_list = [];
var genders = [];
var numbers = [];
var orders = [];
var current_order = "";
var pretty_answers = {};
var controller;
hidden_text = "hidden"

function fixAnswers(corr_answer) {
	let fixed_answers = [];
	fixed_answers.length = 0;
	fixed_answers = corr_answer.split(";");
	console.log(fixed_answers);
	return fixed_answers;
}

function checkAnswer(answer_elem, key, corr_answer) {
	if (document.getElementById("imm").checked) {
		let fixed_answers = [];
		fixed_answers.length = 0;
		fixed_answers = corr_answer.split(";");
		console.log(fixed_answers);
		if (fixed_answers.includes(answer_elem.value)) {
			answer_elem.style.backgroundColor = "#CBFFA9";
			let index = element_list.indexOf(key);
			if (index + 1 < element_list.length) {
				document.getElementById(element_list[index + 1]).focus();
			} else {
				if (document.getElementById("next").checked) {
					nextWord();
					nextWord();
				} else {
					document.getElementById("check").focus();
				}
			}
		} else {
			answer_elem.style.backgroundColor = "#FF9B9B";
		}
	} else {
		answer_elem.style.backgroundColor = "white";
	}
}

function pickWord() {
	if (type === "article") {
		word = json;
		console.log(json);
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

	controller = new AbortController();
	let { signal } = controller;
	for (let [key, value] of Object.entries(word["forms"])) {
		let element = document.getElementById(key);
		console.log(key, value, element);
		element.addEventListener("keyup", function(){checkAnswer(element, key, value)}, { signal });
	}
}

async function init(url, passed) {
	document.getElementById("check").addEventListener("click", function(){nextWord()});
	const res = await fetch("https://martholomew.github.io/grammar-trainer/json/lang_info.json");
	const lang_json = await res.json();
	passed_type = passed;
	let lang_info = lang_json[passed_type];
	type = lang_info["type"];
	numbers = lang_info["numbers"];
	current_order = lang_info["default"];
	if (lang_info["genders"]) {
		genders = lang_info["genders"];
	} else {
		genders = ["null"];
	}

	if (Object.keys(json).length === 0) {
		const res = await fetch(url);
		json = await res.json();
	}

	pickWord();

	if (type === "noun") {
		orders = lang_info["orders"];
		changeOrder(current_order, 1);

		let radios = document.getElementsByName("order");
		for (let radio of radios) {
			radio.addEventListener("change", function(){changeOrder(radio.id, 0)});
		}
	} else if (passed_type === "sga_verb") {
		let verb_forms = ["abs", "conj"];
		for (let form of verb_forms) {
			for (let number of numbers) {
				for (var prs = 1; prs < 4; prs++ ) {
					element_list.push(number + "_" + prs + "_" + form);
				}
			}
		}
	} else if (type === "verb") {
		for (let number of numbers) {
			for (var prs = 1; prs < 4; prs++ ) {
				element_list.push(number + "_" + prs);
			}
		}
	} else if (type === "article") {
		orders = lang_info["orders"];
		changeOrder(current_order, 1);
		hidden_text = "hid";
	}
	if (type !== "noun") {
		for (element of element_list) {
			pretty_answers[element + "_cor"] = word["forms"][element];
		}
	}
	first_field = element_list[0];
}

function changeOrder(order, init) {
	element_list = [];
	let order_list = orders[order];
	console.log(order_list);

	let answer = "";
	let forms = word["forms"];
	for (let gender of genders) {
		for (let number of numbers) {
			let previous_element = document.getElementById(number + "_header_row");
			for (let value of order_list) {
				let extra_answer = "";
				let form_key = "";
				let current_element_name = number + "_" + value + "_row";
				if (passed_type === "sga_noun") {
					if (number === "d" && value === "voc") {
						continue;
					} else if (number === "d" || value === "voc") {
						element_list.push(number + "_" + value + "_part");
						element_list.push(number + "_" + value + "_part_im");
						element_list.push(number + "_" + value);
						element_list.push(number + "_" + value + "_im");
						form_key = number + "_" + value + "_part";
						extra_answer = "<sup>" + forms[number + "_" + value + "_part_im"].toUpperCase() + "</sup> " + forms[number + "_" + value] + "<sup>" + forms[number + "_" + value + "_im"].toUpperCase() + "</sup>";
					} else {
						element_list.push(number + "_" + value);
						element_list.push(number + "_" + value + "_im");
						form_key = number + "_" + value;
						extra_answer = "<sup>" + forms[number + "_" + value + "_im"].toUpperCase() + "</sup>";
					}
				} else if (passed_type === "sga_article") {
					if ((number === "d" && gender !== "a") || (number !== "d" && gender === "a")) {
						continue
					} else {
						element_list.push(gender + "_" + number + "_" + value);
						element_list.push(gender + "_" + number + "_" + value + "_im");
						console.log(element_list);
						form_key = gender + "_" + number + "_" + value;
						extra_answer = "<sup>" + forms[gender + "_" + number + "_" + value + "_im"].toUpperCase() + "</sup>";
					}
				} else {
					element_list.push(number + "_" + value);
					form_key = number + "_" + value;
				}
				answer = forms[form_key] + "extra_answer";
				pretty_answers[number + "_" + value + "_cor"] = answer;
				if (init === 0) {
					let element = document.getElementById(current_element_name);
					previous_element.insertAdjacentElement("afterend", element);
					previous_element = element;
				}
			}
		}
	}
}

function nextWord() {
	if (enter === 0) {
		document.getElementById("check").textContent = "Next";
		let wrong = 0;
		for (let [key, corr_answer] of Object.entries(word["forms"])) {
			let answer_elem = document.getElementById(key);
			fixed_answers = fixAnswers(corr_answer)
			if (fixed_answers.includes(answer_elem.value)) {
				answer_elem.style.backgroundColor = "#CBFFA9";
			} else {
				wrong = 1;
				answer_elem.style.backgroundColor = "#FF9B9B";
			}
		}
		for (let [key, value] of Object.entries(pretty_answers)) {
			document.getElementById(key).innerHTML = value;
		}
		if (wrong === 0) {
				right += 1;
		}
		questions += 1;
		document.getElementById("results").textContent = right + "/" + questions;
		enter = 1;
	} else {
		controller.abort();
		document.getElementById("check").textContent = "Reveal";
		pickWord();
		for (let [key, value] of Object.entries(word["forms"])) {
			document.getElementById(key).style.backgroundColor = "white";
			document.getElementById(key).value = "";
		}
		for (let [key, value] of Object.entries(pretty_answers)) {
			document.getElementById(key).innerHTML = "<i>" + hidden_text + "</i>";
		}
		document.getElementById(first_field).focus();
		if (type === "noun") {
			changeOrder(current_order, 1);
		} else {
			for (element of element_list) {
				pretty_answers[element + "_cor"] = word["forms"][element];
			}
		}
		enter = 0;
	}
}