var next_one = 1;
var word;
var questions = 0;
var right = 0;
var json = {};
hidden_text = "hidden"
async function doFunction(url, type, first_field) {
  if (Object.keys(json).length === 0) {
    const res = await fetch(url);
    json = await res.json();
  }
	if (next_one === 1) {
    next_one = 0;

		if (type === "article") {
			word = json;
			hidden_text = "hid"
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

	let wrong = 0;

	for (const [key, value] of Object.entries(word["forms"])) {
		element = document.getElementById(key);
		if (element.value === value) {
			element.style.backgroundColor = "lime";
		} else {
			element.style.backgroundColor = "red";
			wrong = 1;
		}
		if (type != "noun_sga") {
			document.getElementById(key + "_cor").textContent = value;
		}
	}
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
	if (wrong === 0) {
			right += 1;
	}
	questions += 1;
	document.getElementById("results").textContent = right + "/" + questions;
	next_one = 1;
}