import {toast} from "react-toastify";

export function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

export const shouldShowHost = (resource, userId) => {
  if (resource.status === "new") {
    return true;
  } else if (resource.status === "calling") {
    return true;
  }
  return false;
};

export const updateResource = (resource, fields, onSuccess = null) => {

  fetch(`/api/resource/update/${resource.id}`, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    headers: {
      'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken')
    }, body: JSON.stringify({fields: fields}) // body data type must match "Content-Type" header
  }).then(response => response.json()).then(data => {

    if (data.message) {
      toast(`${data.message}`, {type: data.status});
    }
    if (onSuccess) {
      onSuccess();
    }
  }).catch((error) => {
    console.error('Error:', error);
    toast(`${error}`, {type: "error"});
  });
};

export function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

export const SUB_STATE_OPTIONS = [
  {value: "new", label: "Świeżak"},
  {value: "searching", label: "Szukamy"},
  {value: "in_progress", label: "Host znaleziony"},
  // {value: "gone", label: "Zniknęła"},
  {value: "success", label: "Sukces"},
  {value: "cancelled", label: "Nieaktualne"}
];

export const getStatusDisplay = (status) => {
  const option = SUB_STATE_OPTIONS.filter(o => o.value === status)[0];
  return option.label;
};

export const getPickUpDisplay = (v) => {
  return v ? "Przyjedzie" : "My musimy zawieźć";
};

export const getLatestSubId = async () => {
  const response = await fetch(`/api/latest/subs/`);
  const result = await response.json();
  return result.id;
};


export const getHelped = async () => {
  const response = await fetch(`/api/helped/`);
  const result = await response.json();
  return result.count;
};

export const getLatestHostTimestamp = async () => {
  const response = await fetch(`/api/latest/resources/`);
  const result = await response.json();
  return result.id;
};


export function strToBoolean(value) {
  switch (value) {
    case true:
    case "true":
    case 1:
    case "1":
    case "on":
    case "yes":
      return true;
    default:
      return false;
  }
}
