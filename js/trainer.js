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

function isCorrect(corr_answer, typed_answer) {
	let corr_answer_arr = [];
	corr_answer_arr.length = 0;

	if (document.getElementById("ignore").checked) {
		corr_answer = corr_answer.normalize("NFD").replace(/\p{Diacritic}/gu, "");
		typed_answer = typed_answer.normalize("NFD").replace(/\p{Diacritic}/gu, "");
		console.log("ignore");
	}
	if (corr_answer.includes("|")) {
		corr_answer_arr = corr_answer.split("|");
		typed_answer_arr = typed_answer.split(/[;,.|: ]/);
		is_corr = typed_answer_arr.sort().toString() === corr_answer_arr.sort().toString();
		console.log(corr_answer_arr, typed_answer_arr);
	} else if (corr_answer.includes("(")) {
		corr_answer_arr.push(corr_answer.replace(/\(.*?\)/g, ""));
		corr_answer_arr.push(corr_answer.replace(/[\(\)]/g, ""));
		is_corr = corr_answer_arr.includes(typed_answer);
		console.log(corr_answer_arr, typed_answer);
	} else {
		corr_answer_arr = corr_answer.split(";");
		is_corr = corr_answer_arr.includes(typed_answer);
		console.log(corr_answer_arr, typed_answer);
	}
	return is_corr;
}

function checkAnswer(answer_elem, key, corr_answer) {
	if (document.getElementById("imm").checked) {
		if (isCorrect(corr_answer, answer_elem.value)) {
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
	if ((type !== "noun") && (type !== "article")) {
		for (element of element_list) {
			pretty_answers[element + "_cor"] = word["forms"][element];
		}
	}
	first_field = element_list[0];
}

function changeOrder(order, init) {
	element_list = [];
	let order_list = orders[order];

	let answer = "";
	let forms = word["forms"];
	for (let gender of genders) {
		for (let number of numbers) {
			let previous_element = document.getElementById(number + "_header_row");
			for (let value of order_list) {
				let answer = "";
				let pretty_key = "";
				if (passed_type === "sga_noun") {
					if (number === "d" && value === "voc") {
						continue;
					} else if (number === "d" || value === "voc") {
						element_list.push(number + "_" + value + "_part");
						element_list.push(number + "_" + value + "_part_im");
						answer = forms[number + "_" + value + "_part"] + "<sup>" + forms[number + "_" + value + "_part_im"].toUpperCase() + "</sup> " + forms[number + "_" + value] + "<sup>" + forms[number + "_" + value + "_im"].toUpperCase() + "</sup>";
					} else {
						answer = forms[number + "_" + value] + "<sup>" + forms[number + "_" + value + "_im"].toUpperCase() + "</sup>";
					}
					element_list.push(number + "_" + value);
					element_list.push(number + "_" + value + "_im");
					pretty_key = number + "_" + value + "_cor";
				} else if (passed_type === "sga_article") {
					if ((number === "d" && gender !== "a") || (number !== "d" && gender === "a")) {
						continue
					} else {
						element_list.push(gender + "_" + number + "_" + value);
						element_list.push(gender + "_" + number + "_" + value + "_im");
						answer = forms[gender + "_" + number + "_" + value] + "<sup>" + forms[gender + "_" + number + "_" + value + "_im"].toUpperCase() + "</sup>";
						pretty_key = gender + "_" + number + "_" + value + "_cor";
					}
				} else if (passed_type === "grc_article") {
					if ((number === "d" && gender !== "a") || (number !== "d" && gender === "a")) {
						continue
					} else {
						element_list.push(gender + "_" + number + "_" + value);
						answer = forms[gender + "_" + number + "_" + value]
						pretty_key = gender + "_" + number + "_" + value + "_cor";
					}
				} else {
					element_list.push(number + "_" + value);
					answer = forms[number + "_" + value];
					pretty_key = number + "_" + value + "_cor";
				}
				pretty_answers[pretty_key] = answer;
				if (init === 0) {
					let element = document.getElementById(number + "_" + value + "_row");
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
			if (isCorrect(corr_answer, answer_elem.value)) {
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
		} else if (type === "article") {
		} else {
			for (element of element_list) {
				pretty_answers[element + "_cor"] = word["forms"][element];
			}
		}
		enter = 0;
	}
}