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
var current_order = [];
hidden_text = "hidden"

function checkAnswer(element, key, value) {
	if (document.getElementById("imm").checked) {
		if (element.value === value) {
			element.style.backgroundColor = "#CBFFA9";
			let index = element_list.indexOf(key);
			if (index + 1 < element_list.length) {
				document.getElementById(element_list[index + 1]).focus();
			} else {
				if (document.getElementById("next").checked) {
					let wrong = 0;
					for (let [key, value] of Object.entries(word["forms"])) {
						element = document.getElementById(key);
						if (element.value !== value) {
							wrong = 1;
						}
					}
					if (wrong === 0) {
						enter = 1;
						nextWord();
						return 0;
					}
				}
				document.getElementById("check").focus();
			}
		} else {
			element.style.backgroundColor = "#FF9B9B";
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
	const res = await fetch("https://files.catbox.moe/wdmjr2.json");
	const lang_json = await res.json();

	type = passed_type;
	let lang_info = lang_json[type];
	numbers = lang_info["numbers"];
	if (lang_info["type"] === "noun") {
		orders = lang_info["orders"];
		let default_order = lang_info["default"];
		current_order = orders[default_order];
		for (let number of numbers) {
			for (let value of current_order) {
				if (passed_type === "sga_noun") {
					if (number == "d" || value == "voc") {
						element_list.push(number + "_" + value + "_part");
						element_list.push(number + "_" + value + "_part_im");
						element_list.push(number + "_" + value);
						element_list.push(number + "_" + value + "_im");
					} else {
						element_list.push(number + "_" + value);
						element_list.push(number + "_" + value + "_im");
					}
				} else {
					element_list.push(number + "_" + value);
				}
			}
		}

		let radios = document.getElementsByName("order");
		for (let radio of radios) {
			radio.addEventListener("change", function(){changeOrder(radio.id)});
		}
	} else if (type === "sga_verb") {
		let verb_forms = ["abs", "conj"];
		for (let form of verb_forms) {
			for (let number of numbers) {
				for (var prs = 1; prs < 4; prs++ ) {
					element_list.push(number + "_" + prs + "_" + form);
				}
			}
		}
	} else if (lang_info["type"] === "verb") {
		for (let number of numbers) {
			for (var prs = 1; prs < 4; prs++ ) {
				element_list.push(number + "_" + prs);
			}
		}
	} else if (lang_info["type"] === "article") {
		for (let number of numbers) {
			for (var prs = 1; prs < 4; prs++ ) {
				element_list.push(number + "_" + prs);
			}
		}
	}
	if (Object.keys(json).length === 0) {
		const res = await fetch(url);
		json = await res.json();
	}
	first_field = element_list[0];
	pickWord();
}

function changeOrder(order) {
	element_list = [];
	current_order = orders[order];
	for (let number of numbers) {
		let previous_element = document.getElementById(number + "_header_row");
		for (let value of current_order) {
			let current_element_name = number + "_" + value + "_row";
			if (passed_type === "sga_noun") {
				if ((number == "s" || number == "p") && value !== "voc") {
					element_list.push(number + "_" + value);
					element_list.push(number + "_" + value + "_im");
				} else {
					element_list.push(number + "_" + value + "_part");
					element_list.push(number + "_" + value + "_part_im");
					element_list.push(number + "_" + value);
					element_list.push(number + "_" + value + "_im");
				}
			} else {
				element_list.push(number + "_" + value);
			}
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
				element.style.backgroundColor = "#FF9B9B";
			} else {
				element.style.backgroundColor = "#CBFFA9";
			}
			if (type !== "sga_noun") {
				document.getElementById(key + "_cor").textContent = value;
			}
		}
		if (wrong === 0) {
				right += 1;
		}
		questions += 1;
		document.getElementById("results").textContent = right + "/" + questions;
		if (type === "noun_sga") {
			let answer = "";
			let forms = word["forms"];
			for (a_case of current_order) {
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

			if (type != "sga_noun") {
				document.getElementById(key + "_cor").innerHTML = "<i>" + hidden_text + "</i>";
			}
			else {
				for (a_case of current_order) {
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