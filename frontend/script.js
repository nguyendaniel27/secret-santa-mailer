userCards = {}
UIDIndex = 0

function validateEmail(email) {
    // Stackoverflow is key to success
    return String(email).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
}

function errorLog(error) {
    // Set the text and opacity of the error box
    document.getElementById("errorBox").textContent = error
    document.getElementById("errorBox").classList.add("opaque")

    // Set a timeout of when to hide the box again
    setTimeout(errorClear, error.length*100 + 3000)
}

function errorClear() {
    // this is probably bad because the box can flash if an error is spammed
    // but proper implementation sounds hard, so this stays for now

    document.getElementById("errorBox").classList.remove("opaque")
}

function addUserCard(fname, lname, email) {
    // I don't remember why I wrote it this way

    // get the user card area
    let uCardArea = document.getElementById("uCardArea")

    // clone the template
    let uCard = document.getElementById("uCardTemplate").cloneNode(true)

    // remove the template ID
    uCard.id = ""

    // set the elements of the card
    uCard.getElementsByClassName("name-card__f-name")[0].innerHTML = fname
    uCard.getElementsByClassName("name-card__l-name")[0].innerHTML = lname
    uCard.getElementsByClassName("name-card__email")[0].innerHTML = email
    uCard.getElementsByClassName("name-card__UID-text")[0].innerHTML = String(UIDIndex)

    // set the mirrored object
    uCard.UID = UIDIndex
    uCard.fName = fname
    uCard.lName = lname
    uCard.email = email

    // generate the UID
    userCards[UIDIndex] = uCard

    // iterate the index
    UIDIndex += 1

    // remove the hidden display style assigned by template
    uCard.classList.remove("template")

    // add it to the user card area
    uCardArea.appendChild(uCard)

    // return the reference just in case
    return uCard
}

function addExclusion(userCard, uid) {
    // if a user doesn't have an exclusions table, add it

    // I have absolutely no clue why this isn't generated
    // when the users are created, though, and I don't really
    // want to break something in this very shoddy setup

    if (userCard.exclusions == undefined) {
        userCard.exclusions = []
    }

    // this is very similar to the user card system

    // get the exclusion card area
    let eCardArea = userCard.getElementsByClassName("name-card__exclusion-list")[0]

    // clone the exclusion card template
    let eCard = userCard.getElementsByClassName("exclusion-card template")[0].cloneNode(true)

    // push the UID exclusion to the exclusion array
    userCard.exclusions.push(uid)
    
    // set the data in the ecard
    eCard.getElementsByClassName("exclusion-card__uid")[0].innerHTML = uid
    eCard.UID = uid

    // remove template
    eCard.classList.remove("template")

    // append ecard to ecardarea
    eCardArea.appendChild(eCard)

    // return ecard
    return eCard
}

function deleteUserCard(elem) {
    // get the UID of the usercard element
    let uid = elem.parentElement.parentElement.getElementsByClassName("name-card__UID-text")[0].innerHTML
    
    // delete the usercard from the usercard container
    delete userCards[Number(uid)]

    // remove the element from the DOM flow
    elem.parentElement.parentElement.parentElement.remove()
}

function deleteECard(elem) {
    //get ucard
    let uCard = elem.parentElement.parentElement.parentElement.parentElement.parentElement

    // remove exclusion from ucard
    uCard.exclusions = uCard.exclusions.filter(x => elem.parentElement.UID == x)

    // remove exclusion from DOM flow
    elem.parentElement.remove()
}

function submitUserCard() {
    // Chrome decides to ignore autofill disable tags, so here's some random ids that are kind of similar to the originals :/
    let fname = document.getElementById("fin")
    let lname = document.getElementById("lin")
    let email = document.getElementById("ein")

    // validate email
    if (validateEmail(email.value)) {
        // first name can't be blank
        if (fname.value != "") {
            // last name can't be blank
            if (lname.value != "") {
                // add a user card
                addUserCard(fname.value, lname.value, email.value)

                // set the fields to blank
                fname.value = ""
                lname.value = ""
                email.value = ""
            } else {
                errorLog("Error: Blank last name.")
            }
        } else {
            errorLog("Error: Blank first name.")
        }
    } else {
        errorLog("Error: Invalid email.")
    }
}

function clearUserCard() {
    // just clears the usercard same as when it's added

    let fname = document.getElementById("fname")
    let lname = document.getElementById("lname")
    let email = document.getElementById("email")

    fname.value = ""
    lname.value = ""
    email.value = ""
}

function submitECard(elem) {
    // grab inputs and user card
    let ifield = elem.parentElement.getElementsByTagName("input")[0]
    let ucard = elem.parentElement.parentElement.parentElement

    // add an exclusion field just incase, again
    if (ucard.exclusions == undefined) {
        ucard.exclusions = []
    }

    // check for blank fields
    if (ifield.value != "") {
        if (userCards[Number(ifield.value)] != undefined) { // check if the exclusion exists
            if (ucard.getElementsByClassName("name-card__UID-text")[0].innerHTML != ifield.value) { // check if the exclusion is the same as the one excluding
                if (!ucard.exclusions.includes(ifield.value)) { // check if the exclusion is already excluded
                    addExclusion(ucard, ifield.value)
                    ifield.value = ""
                } else {
                    errorLog("Error: UID already excluded.")
                }
            } else {
                errorLog("Error: Cannot exclude self.")
            }
        } else {
            errorLog("Error: Invalid UID.")
        }
    } else {
        errorLog("Error: Blank UID.")
    }
}

function matchUsers(userTable) {

    // pure black magic that I don't remember writing

	let uTCopy = JSON.parse(JSON.stringify(userTable))
	
	let sortedUT = Object.values(uTCopy)

    sortedUT.sort(() => Math.random() - 0.5)

    let currentUser = sortedUT[0]

	sortedUT.sort((a, b) => b.exclusions.length - a.exclusions.length)
	
	let match = []
	
	while (true) {
		
		if (sortedUT.length == 0) {
			break
		}
		
		let cUserAllowed = [...sortedUT]
		cUserAllowed = cUserAllowed.filter(x => !(currentUser.exclusions.includes(String(x.UID))) && currentUser.UID != x.UID)
		
		if (cUserAllowed.length == 0) {
            if (match.length == 0) {
                break
            }
			match.push([currentUser.UID, match[0][0]])
			break
		}
		
		match.push([currentUser.UID, cUserAllowed[0].UID])
		
		sortedUT = sortedUT.filter(x => x.UID != currentUser.UID)
		
		currentUser = cUserAllowed[0]
	}
	
	return match
}

function matchCheck (match, userTable) {
    // a function for checking if any match is actually valid,
    // important to the brute-force method

    if (match.length == 0) {
        return false
    }
	for (let val of match) {
		if (userTable[val[0]].exclusions.includes(String(val[1]))) {
			return false
		}
	}
	return true
}

function generatePairs() {
    // very bad implementation of a semi-optimized pretty much brute-force algorithm
    // please fix if possible

    let timeout = 0

    for (let val of Object.values(userCards)) {
        if (val.exclusions == undefined) {
            val.exclusions = []
        } 
    }
    
    let match
    while (true) {
        timeout += 1
        match = matchUsers(userCards)
        if (matchCheck(match, userCards)) {
            break
        }

        if (timeout == 1000) { // tries 1k times, a more efficent way probably exists

            errorLog("Error: Something went wrong generating the matches. Please check your exclusions, or try again.")

            // debug returns
            return false
        }
    }
    loopbreak = false

    // websocket to send the data to the nodejs server
    let webSocket = new WebSocket("ws://" + window.location.hostname + "/message");
    webSocket.onopen = function (event) {
        webSocket.send(JSON.stringify([userCards, match]))
        webSocket.close()
    }

    // debug returns
    return true, match
}