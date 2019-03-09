const dataController = (function () {
	class Project {
		constructor(id, title) {
			this.id = id
			this.title = title
		}
	}
	const projects = {
		allProjects: []
	}

	return {
		addProject: (title) => {
			let ID
			if (projects.allProjects.length > 0) {
				ID = projects.allProjects[projects.allProjects.length - 1].id + 1
			} else {
				ID = 0
			}
			const newProject = new Project(ID, title)
			projects.allProjects.push(newProject)
			return newProject
		},
		updateTitle: (newTitle, ID) => {
			const projectToUpdate = projects.allProjects.find(project => project.id === ID)
			projectToUpdate.title = newTitle
		},
		deleteData: (ID) => {
			const currentProject = projects.allProjects.map(current => current.id)
			const index = currentProject.indexOf(ID)
			if (index !== -1) {
				projects.allProjects.splice(index, 1)
			}
		}
	}
})()

const UIController = (function () {
	let intervalID
	const DOMstrings = {
		projectForm: '.project-form',
		inputValue: 'input[type="text"]',
		projectList: '.projects',
		hoursSpan: '.hours',
		minutesSpan: '.minutes',
		secondsSpan: '.seconds'
	}
	const {
		projectForm,
		inputValue,
		projectList,
		hoursSpan,
		minutesSpan,
		secondsSpan
	} = DOMstrings
	return {
		getInput: () => {
			return document.querySelector(inputValue)
		},
		addProjectToUI: (obj) => {
			const html = `
            <li id="project-${obj.id}">
                <h2>${obj.title}</h2>
                <div class="timer">
                    <p class="timer-label">Total Time Spent</p>
                    <p class="timer-text"><span class="hours">00</span>:<span class="minutes">00</span>:<span class="seconds">00</span></p>
                </div>
                <button class="btn start">Start</button>
                <button class="delete-btn"><i class="fa fa-times"></i></button>
            </li>
            `
			document.querySelector(projectList).insertAdjacentHTML('beforeend', html)
		},
		clearField: () => {
			const input = document.querySelector(inputValue)
			input.value = ''
		},
		startTimer: (event) => {
			const target = event.target.previousElementSibling.lastElementChild
			const seconds = target.querySelector(secondsSpan)
			const minutes = target.querySelector(minutesSpan)
			const hours = target.querySelector(hoursSpan)
			let sec = 0
			intervalID = setInterval(() => {
				sec++
				seconds.textContent = (`0${sec % 60}`).substr(-2)
				minutes.textContent = (`0${(parseInt(sec / 60)) % 60}`).substr(-2)
				hours.textContent = (`0${parseInt(sec / 3600)}`).substr(-2)
			}, 1000)
			target.setAttribute('timer-id', intervalID)
		},
		stopTimer: (event) => {
			const target = event.target.previousElementSibling.lastElementChild
			clearInterval(target.getAttribute('timer-id'))
		},
		edit: (event) => {
			const input = document.createElement('input')
			const title = event.target
			const parent = title.parentNode
			input.value = title.textContent
			parent.insertBefore(input, title)
			parent.removeChild(title)
		},
		save: (event) => {
			const title = document.createElement('h2')
			const input = event.target
			const parent = input.parentNode
			title.textContent = input.value
			parent.insertBefore(title, input)
			parent.removeChild(input)
			return title.textContent
		},
		delete: (projectID) => {
			const projectToDelete = document.getElementById(projectID)
			projectToDelete.parentNode.removeChild(projectToDelete)
		},
		getDOMstrings: () => {
			return DOMstrings
		}
	}
})()

const controller = ((dataCtrl, UICtrl) => {
	const setupEventListeners = () => {
		const DOM = UICtrl.getDOMstrings()
		const form = document.querySelector(DOM.projectForm)
		form.addEventListener('submit', ctrlAddProject)
		const projects = document.querySelector(DOM.projectList)
		projects.addEventListener('click', (event) => {
			const target = event.target
			if (target.className === 'btn start' || target.className === 'btn start stop') {
				timer(event)
			}
			if (target.tagName === 'H2') {
				editTitle(event)
			}
			if (target.className === 'delete-btn') {
				deleteProject(event)
			}
		})
		projects.addEventListener('keypress', (event) => {
			if (event.keyCode === 13 || event.which === 13) {
				saveTitle(event)
			}
		})
	}

	const ctrlAddProject = (event) => {
		event.preventDefault()
		const dirty = UICtrl.getInput().value
		const clean = DOMPurify.sanitize(dirty)
		if (clean !== '') {
			const newProject = dataCtrl.addProject(clean)
			UICtrl.addProjectToUI(newProject)
			UICtrl.clearField()
		}
	}

	const timer = (event) => {
		const target = event.target
		target.classList.toggle('stop')
		if (target.textContent === 'Start') {
			target.textContent = 'Stop'
			UICtrl.startTimer(event)
		} else if (target.textContent === 'Stop') {
			target.textContent = 'Start'
			UICtrl.stopTimer(event)
		}
	}

	const editTitle = (event) => {
		UICtrl.edit(event)
	}
	const saveTitle = (event) => {
		const ID = parseInt(event.target.parentNode.id.slice(8))
		const newTitle = UICtrl.save(event)
		dataCtrl.updateTitle(newTitle, ID)
	}

	const deleteProject = (event) => {
		const target = event.target
		const projectID = target.parentNode.id
		const ID = parseInt(target.parentNode.id.slice(8))
		if (projectID) {
			dataCtrl.deleteData(ID)
			UICtrl.delete(projectID)
		}
	}
	return {
		init: () => {
			setupEventListeners()
		}
	}

})(dataController, UIController)

controller.init()