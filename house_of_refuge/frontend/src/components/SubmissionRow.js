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

const statusAsNumber = (value) => {
  switch (value) {
    case "new":
      return 0;
    case "searching":
      return 1;
    case "in_progress":
      return 2;
    case "cancelled":
      return 3;
    case "success":
      return 4;
    default:
      return 10;
  }
};


const updateSub = (sub, fields, onCorrect = null) => {

  fetch(`/api/sub/update/${sub.id}`, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    headers: {
      'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken')
    }, body: JSON.stringify({fields: fields}) // body data type must match "Content-Type" header
  }).then(response => response.json()).then(data => {

    if (data.status === "success") {
      if (onCorrect) {

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
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setLocalSub(sub);
    setNote(sub.note);
    setStatus(sub.status);
  }, [sub]);

  const btnHandler = () => {
    if (readOnly) {
      return;
    }

    activeHandler(sub, isActive);
  };



  const getActionBtn = () => {
    if (readOnly || isActive || statusAsNumber(localSub.status) > 2) {
      return "";
    }
    if (localSub.status === "in_progress") {
      if (localSub.coordinator) {
        return "";
      } else {
        return <Button size={"sm"} onClick={setCoordinator}>Przypisz do siebie</Button>;
      }
    } else if (localSub.status === "searching" && !isOwner) {
      return "";
    } else if (localSub.matcher && !isActive && !isOwner) {
      return <Button size={"sm"} disabled>{localSub.matcher.display}</Button>;
    } else if (localSub.status === "cancelled") {
      return "NIEAKTUALNE";
    } else {
      return <Button className={"w-100"} size={"sm"} onClick={btnHandler}>{isActive ? "Zwolnij" : "Szukaj Hosta"}</Button>;
    }
  };

  const updateStatus = (value) => {

    const newStatus = value[0].value;
    if (newStatus !== localSub.status) {
      updateSub(localSub, {"status": newStatus}, () => setStatus(newStatus));
      setLocalSub((s) => ({...s, status: newStatus}));
    } else {

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

    fetch(`/api/sub/update/${localSub.id}`, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken')
      }, body: JSON.stringify({fields: {"coordinator_id": user.id}}) // body data type must match "Content-Type" header
    }).then(response => response.json()).then(data => {

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
    <div className="sub-id position-relative">
      ID ZG??OSZENIA: {localSub.id}

      <div className="submission-row-collapse cursor-pointer" onClick={() => setCollapsed(!collapsed)}>
        Zwi?? / Rozwi??
      </div>
    </div>
    <Table className="sub-table" style={{'background-color': 'rgba(255, 255, 255, 0.95)', display: collapsed ? 'none' : 'table'}}>
      <tbody>
      <tr>
        <th>Imie</th>
        <td>{localSub.name}</td>
        <th>Ile Os??b?</th>
        <td>{localSub.people}</td>
        <th>Jak dlugo?</th>
        <td>
          <EditableField value={localSub.how_long} onRename={
            (value) => updateSub(localSub, {"how_long": value}, () => setLocalSub((s) => ({...s, how_long: value})))}/>
        </td>
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
        <td>
          {statusAsNumber(localSub.status) < 2 ?
          <input type="date" required min={new Date().toJSON().slice(0, 10)}
                 value={localSub.when}
                 onChange={(e) => {
                   const value = e.target.value;


                   if (e && localSub.when !== value) {
                     updateSub(localSub,
                         {"when": value},
                         () => setLocalSub((s) => ({...s, when: value}))
                     );
                   }
                 }}/> : localSub.when}
        </td>
        <th>Opis:</th>
        <td>{localSub.description}</td>
        <th>J??zyki</th>
        <td>{localSub.languages}</td>
        <th>Narodowo????</th>
        <td>{localSub.origin}</td>
      </tr>
      <tr>
        <th>Ma zwierz??ta</th>
        <td>{localSub.traveling_with_pets}</td>
        <th>Czy mo??e spa?? ze zwierz??tami?</th>
        <td>{localSub.can_stay_with_pets}</td>
        <th>Potrzebuje transportu?</th>
        <td>{localSub.transport_needed ? "tak" : "nie"}</td>
        <th>Notka</th>
        <td>
          <EditableField value={note} onRename={(note) => updateSub(localSub, {"note": note}, () => setNote(note))}/>
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
        <th>Osoba zg??aszaj??ca</th>
        <td>{localSub.receiver?.display || localSub.contact_person}</td>
        <th>{["searching", "new"].includes(localSub.status) ? "Hosta szuka" : "Host znaleziony przez"}</th>
        <td>{localSub.matcher?.display || getActionBtn()}</td>
        <th>????cznik</th>
        <td>{localSub.coordinator?.display || (localSub.matcher ? getActionBtn() : "")}</td>
        <th>
          Status
        </th>
        <td>
          {isGroupAdmin ? <Select
              values={SUB_STATE_OPTIONS.filter((o) => o.value === status)}
              options={SUB_STATE_OPTIONS}
              onChange={updateStatus}
          /> : getStatusDisplay(status)}
        </td>
      </tr>
      {isCoordinator && !isGroupAdmin && statusAsNumber(localSub.status) < 3 && <tr>
        <td className={"text-center"} colSpan={2}><Button variant={"secondary"} size={"sm"} onClick={() => updateStatus([{value: "cancelled"}])}>Nieaktualne</Button></td>
        <td colSpan={4}/>
        <td className={"text-center"} colSpan={2}><Button variant={"success"} size={"sm"} onClick={() => updateStatus([{value: "success"}])}>Sukces</Button></td>
      </tr>}
      {isActive && !readOnly && statusAsNumber(localSub.status) < 3 && <tr>
        <td className={"text-center"} colSpan={2}><Button variant={"secondary"} size={"sm"}
                                                          onClick={() => activeHandler(sub, true, true)}>Nieaktualne</Button>
        </td>
        <td colSpan={4}/>
        <td className={"text-center"} colSpan={2}><Button variant={"primary"} size={"sm"}
                                                          onClick={btnHandler}>Zwolnij</Button>
        </td>
      </tr>}
      {isGroupAdmin && !isActive && !readOnly && <tr className="no-striping">
        <th>Akcje koordynatora</th>
        <td colSpan={1} className={"text-center"}>
          <Dropdown>
            <Dropdown.Toggle variant="secondary" size={"sm"}>
              Zmie?? ??r??d??o
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
              <Button variant={"secondary"} size={"sm"} onClick={freeUpMatcher}>Zwolnij zg??oszenie</Button>}
        </td>
        <td colSpan={2} className={"text-center"}>
          {localSub.coordinator &&
              <Button variant={"secondary"} size={"sm"} onClick={freeUpCoord}>Zwolnij ????cznika</Button>}
        </td>
      </tr>}
      </tbody>
    </Table>
    <p className="sub-id">Przyj??te: {localSub.created}</p>
  </div>;
}
