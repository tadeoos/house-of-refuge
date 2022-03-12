import React, {useEffect, useState} from "react";
import {Button, Dropdown, Table} from "react-bootstrap";
import {getCookie, getPickUpDisplay, SUB_STATE_OPTIONS} from "../scripts/utils";
import Select from "react-dropdown-select";
import {EditableField} from "./Shared";
import {toast} from "react-toastify";

const getStatusDisplay = (status) => {
  const option = SUB_STATE_OPTIONS.filter(o => o.value === status)[0];
  return option.label;
};


const updateSub = (sub, fields, onCorrect = null) => {
  console.log('sub update:', fields);
  fetch(`/api/sub/update/${sub.id}`, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    headers: {
      'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken')
    }, body: JSON.stringify({fields: fields}) // body data type must match "Content-Type" header
  }).then(response => response.json()).then(data => {
    console.log('Response: ', data);
    if (data.status === "success") {
      if (onCorrect) {
        console.log("doing on correct");
        onCorrect();
      }
    }
    // toast(`${data.message}`, {type: data.status});
  }).catch((error) => {
    console.error('Error:', error);
    toast(`THERE WAS AN ERROR:\n${error}`, {type: "error", autoClose: 3000});
  });
};


export function SubmissionRow({sub, activeHandler, user, isGroupCoordinator, isActive = false, readOnly = false}) {


  const isGroupAdmin = isGroupCoordinator;
  const isOwner = user.id === sub.matcher?.id;
  const isCoordinator = user.id === sub.coordinator?.id;
  const [status, setStatus] = useState(sub.status);
  const [note, setNote] = useState(sub.note);
  const [localSub, setLocalSub] = useState(sub);

  useEffect(() => {
    setLocalSub(sub);
    setNote(sub.note);
    setStatus(sub.status);
  }, [sub]);


  const btnHandler = () => {
    if (readOnly) {
      return;
    }
    console.log("btn handler clicked");
    activeHandler(sub, isActive);
  };



  const getActionBtn = () => {
    if (readOnly || isActive) {
      return "";
    }
    if (localSub.status === "in_progress") {
      if (localSub.coordinator) {
        return isCoordinator ? "" : <Button size={"sm"} disabled>{localSub.coordinator.display}</Button>;
      } else {
        return <Button size={"sm"} onClick={setCoordinator}>Przypisz do siebie</Button>;
      }
    } else if (localSub.status === "searching" && !isOwner) {
      return "";
    } else if (localSub.matcher && !isActive && !isOwner) {
      return <Button size={"sm"} disabled>{localSub.matcher.display}</Button>;
    } else if (localSub.status === "cancelled") {
      return "NIEKATUALNE";
    } else {
      return <Button size={"sm"} onClick={btnHandler}>{isActive ? "Zwolnij" : "Szukaj Hosta"}</Button>;
    }
  };

  const updateStatus = (value) => {
    console.log("Updating sub value: ", value);
    const newStatus = value[0].value;
    if (newStatus !== localSub.status) {
      updateSub(localSub, {"status": newStatus}, () => setStatus(newStatus));
      setLocalSub((s) => ({...s, status: newStatus}));
    } else {
      console.log("would update but we're smart now..");
    }
  };

  const freeUpMatcher = () => {
    updateSub(sub, {"matcher": null, "status": "new"}, () => {
      setStatus("new");
      setLocalSub((s) => ({...s, matcher: null}));
    });
  };

  const freeUpCoord = () => {
    updateSub(sub, {"coordinator": null}, () => {
      setLocalSub((s) => ({...s, coordinator: null}));
    });
  };


  const setCoordinator = () => {
    console.log("sub status update");
    fetch(`/api/sub/update/${localSub.id}`, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken')
      }, body: JSON.stringify({fields: {"coordinator_id": user.id}}) // body data type must match "Content-Type" header
    }).then(response => response.json()).then(data => {
      console.log('Response: ', data);
      // toast(`${data.message}`, {type: data.status});
      setLocalSub(s => ({...s, coordinator: user}));
    }).catch((error) => {
      console.error('Error:', error);
    });
  };

  const getStatusClass = (sub) => {
   if (sub.status === "in_progress" && sub.resource?.will_pick_up_now) {
     return "sub-in-progress-host-coming";
   }
    return `sub-${localSub.status.replace("_", "-")}`;
  };

  return <div
      className={`submission-row ${getStatusClass(localSub)}
      ${localSub.accomodation_in_the_future ? "sub-in-future" : ""} ${isActive ? "sub-active" : ""}`}>
    <p className="sub-id">ID ZGŁOSZENIA: {localSub.id}</p>
    <Table className="sub-table">
      <tbody>
      <tr>
        <th>Imie</th>
        <td>{localSub.name}</td>
        <th>Ile Osób?</th>
        <td>{localSub.people}</td>
        <th>Jak dlugo?</th>
        <td>{localSub.how_long}</td>
        <th>Telefon</th>
        <td><EditableField
            value={localSub.phone_number}
            onRename={(phone) => updateSub(localSub, {"phone_number": phone}, () => setLocalSub(s => ({
              ...s,
              phone_number: phone
            })))}/></td>
      </tr>
      <tr>
        <th>Od Kiedy?</th>
        <td>{localSub.when}</td>
        <th>Opis:</th>
        <td>{localSub.description}</td>
        <th>Języki</th>
        <td>{localSub.languages}</td>
        <th>Narodowość</th>
        <td>{localSub.origin}</td>
      </tr>
      <tr>
        <th>Ma zwierzęta</th>
        <td>{localSub.traveling_with_pets}</td>
        <th>Czy może spać ze zwierzętami?</th>
        <td>{localSub.can_stay_with_pets}</td>
        <th>Potrzebuje transportu?</th>
        <td>{localSub.transport_needed ? "tak" : "nie"}</td>
        <th>Notka</th>
        <td><EditableField value={note} onRename={(note) => updateSub(localSub, {"note": note}, () => setNote(note))}/>
        </td>
      </tr>
      {localSub.resource && <tr className="tr-host">
        <th>HOST</th>
        <td>{localSub.resource.name}</td>
        <td>{localSub.resource.address}</td>
        <td>{localSub.resource.phone_number}</td>
        <td>{getPickUpDisplay(localSub.resource.will_pick_up_now)}</td>
        <td colSpan={3}>{localSub.resource.note}</td>
      </tr>}
      <tr>
        <th>Osoba zgłaszająca</th>
        <td>{localSub.receiver?.display || localSub.contact_person}</td>
        <th>{["searching", "new"].includes(localSub.status) ? "Hosta szuka" : "Host znaleziony przez"}</th>
        <td>{localSub.matcher?.display || getActionBtn()}</td>
        <th>Łącznik</th>
        <td>{localSub.coordinator?.display || (localSub.matcher ? getActionBtn() : "")}</td>
        <th>
          status
        </th>
        <td>
          {isGroupAdmin ? <Select
              values={SUB_STATE_OPTIONS.filter((o) => o.value === status)}
              options={SUB_STATE_OPTIONS}
              onChange={updateStatus}
          /> : getStatusDisplay(status)}
        </td>
      </tr>
      {isCoordinator && !isGroupAdmin && <tr>
        <td className={"text-center"} colSpan={2}><Button variant={"secondary"} size={"sm"} onClick={() => updateStatus([{value: "cancelled"}])}>Nieaktualne</Button></td>
        <td colSpan={4}/>
        <td className={"text-center"} colSpan={2}><Button variant={"success"} size={"sm"} onClick={() => updateStatus([{value: "success"}])}>Sukces</Button></td>
      </tr>}
      {isActive && !readOnly && <tr>
        <td className={"text-center"} colSpan={2}><Button variant={"secondary"} size={"sm"}
                                                          onClick={() => activeHandler(sub, true, true)}>Nieaktualne</Button>
        </td>
        <td colSpan={4}/>
        <td className={"text-center"} colSpan={2}><Button variant={"primary"} size={"sm"}
                                                          onClick={btnHandler}>Zwolnij</Button>
        </td>
      </tr>}
      {isGroupAdmin && !isActive && !readOnly && <tr>
        <th>Akcje koordynatora</th>
        <td colSpan={1} className={"text-center"}>
          <Dropdown>
            <Dropdown.Toggle variant="secondary" size={"sm"}>
              Zmień źródło
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item disabled={localSub.source === "terrain"}
                             onClick={() => updateSub(localSub, {source: "terrain"})}>Zachodni</Dropdown.Item>
              <Dropdown.Item disabled={localSub.source === "webform"}
                             onClick={() => updateSub(localSub, {source: "webform"})}>Strona</Dropdown.Item>
              <Dropdown.Item disabled={localSub.source === "mail"}
                             onClick={() => updateSub(localSub, {source: "mail"})}>Email</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </td>
        <td colSpan={2} className={"text-center"}>
          {localSub.matcher &&
              <Button variant={"secondary"} size={"sm"} onClick={freeUpMatcher}>Zwolnij zgłoszenie</Button>}
        </td>
        <td colSpan={2} className={"text-center"}>
          {localSub.coordinator &&
              <Button variant={"secondary"} size={"sm"} onClick={freeUpCoord}>Zwolnij łącznika</Button>}
        </td>
      </tr>}
      </tbody>
    </Table>
    <p className="sub-id">Przyjęte: {localSub.created}</p>
  </div>;
}