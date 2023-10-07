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

	    if (type === "noun") {
			let chosen_decl = [];
			let decl_nums = ["d1", "d2", "d3", "d4", "d5"];
			for (num of decl_nums) {
				if (document.getElementById(num).checked) {
					chosen_decl = chosen_decl.concat(json[num]);
				}
			}

			let random_int = Math.floor(Math.random() * chosen_decl.length);
			word = chosen_decl[random_int];
			if (document.getElementById("minim").checked) {
				document.getElementById("word").textContent = word["word"];
			} else {
				document.getElementById("word").textContent = word["word_more"];
			}
		}
		else if (type === "verb") {
			let chosen_conj = [];
			let conj_nums = ["irr", "c1", "c2", "c3", "c4"];
			for (num of conj_nums) {
				if (document.getElementById(num).checked) {
					chosen_conj = chosen_conj.concat(json[num]);
				}
			}

			let random_int = Math.floor(Math.random() * chosen_conj.length);
			word = chosen_conj[random_int];
			if (document.getElementById("minim").checked) {
				document.getElementById("word").textContent = word["word"];
			} else {
				document.getElementById("word").textContent = word["word_more"];
			}
		}
		else if (type === "article") {
			word = json;
			hidden_text = "hid"
		}

		for (const [key, value] of Object.entries(word["forms"])) {
			document.getElementById(key).style.backgroundColor = "white";
			document.getElementById(key).value = "";
			document.getElementById(key + "_cor").innerHTML = "<i>" + hidden_text + "</i>";
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
		document.getElementById(key + "_cor").textContent = value;
	}
	if (wrong === 0) {
			right += 1;
	}
	questions += 1;
	document.getElementById("results").textContent = right + "/" + questions;
	next_one = 1;
}