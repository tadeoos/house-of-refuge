import React, {useEffect, useState} from "react";
import {Button, Dropdown, Table} from "react-bootstrap";
import {getCookie, getPickUpDisplay, SUB_STATE_OPTIONS} from "../scripts/utils";
import Select from "react-dropdown-select";
import {EditableField} from "./Shared";
import {toast} from "react-toastify";
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('backoffice');

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
      return t('out_of_date');
    } else {
      return <Button size={"sm"} onClick={btnHandler}>{isActive ? t('set_free') : t('search_for_host')}</Button>;
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
    <p className="sub-id">{t('submission_id')}: {localSub.id}</p>
    <Table className="sub-table">
      <tbody>
      <tr>
        <th>{t('name')}</th>
        <td>{localSub.name}</td>
        <th>{t('people_count')}</th>
        <td>{localSub.people}</td>
        <th>{t('how_long')}</th>
        <td>
          <EditableField value={localSub.how_long} onRename={
            (value) => updateSub(localSub, {"how_long": value}, () => setLocalSub((s) => ({...s, how_long: value})))}/>
        </td>
        <th>{t('phone')}</th>
        <td><EditableField
            value={localSub.phone_number}
            onRename={(phone) => updateSub(localSub, {"phone_number": phone}, () => setLocalSub(s => ({
              ...s,
              phone_number: phone
            })))}/></td>
      </tr>
      <tr>
        <th>{t('since_when')}</th>
        <td>
          {statusAsNumber(localSub.status) < 2 ?
          <input type="date" required min={new Date().toJSON().slice(0, 10)}
                 value={localSub.when}
                 onChange={(e) => {
                   const value = e.target.value;
                   console.log("value: ", value);
                   console.log("local sub: ", localSub.when);
                   if (e && localSub.when !== value) {
                     updateSub(localSub,
                         {"when": value},
                         () => setLocalSub((s) => ({...s, when: value}))
                     );
                   }
                 }}/> : localSub.when}
        </td>
        <th>{t('description')}:</th>
        <td>{localSub.description}</td>
        <th>{t('languages')}</th>
        <td>{localSub.languages}</td>
        <th>{t('nationality')}</th>
        <td>{localSub.origin}</td>
      </tr>
      <tr>
        <th>{t('has_pets')}</th>
        <td>{localSub.traveling_with_pets}</td>
        <th>{t('can_sleep_with_pets')}</th>
        <td>{localSub.can_stay_with_pets}</td>
        <th>{t('needs_transport')}</th>
        <td>{localSub.transport_needed ? t('yes') :  t('no')}</td>
        <th>{t('note')}</th>
        <td>
          <EditableField value={note} onRename={(note) => updateSub(localSub, {"note": note}, () => setNote(note))}/>
        </td>
      </tr>
      {localSub.resource && <tr className="tr-host">
        <th>{t('host')}</th>
        <td>{localSub.resource.name}</td>
        <td>{localSub.resource.address}</td>
        <td>{localSub.resource.phone_number}</td>
        <td>{getPickUpDisplay(localSub.resource.will_pick_up_now)}</td>
        <td colSpan={3}>{localSub.resource.note}</td>
      </tr>}
      <tr>
        <th>{t('submitting_person')}</th>
        <td>{localSub.receiver?.display || localSub.contact_person}</td>
        <th>{["searching", "new"].includes(localSub.status) ? t('looking_for_host') : t('host_found_by')}</th>
        <td>{localSub.matcher?.display || getActionBtn()}</td>
        <th>{t('connection')}</th>
        <td>{localSub.coordinator?.display || (localSub.matcher ? getActionBtn() : "")}</td>
        <th>
          {t('status')}
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
                                                          onClick={btnHandler}>{t('set_free')}</Button>
        </td>
      </tr>}
      {isGroupAdmin && !isActive && !readOnly && <tr className="no-striping">
        <th>{t('coordinators_actions')}</th>
        <td colSpan={1} className={"text-center"}>
          <Dropdown>
            <Dropdown.Toggle variant="secondary" size={"sm"}>
              {t('change_source')}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item disabled={localSub.source === "terrain"}
                             onClick={() => updateSub(localSub, {source: "terrain"})}>{t('source_option_terrain')}</Dropdown.Item>
              <Dropdown.Item disabled={localSub.source === "webform"}
                             onClick={() => updateSub(localSub, {source: "webform"})}>{t('source_option_webform')}</Dropdown.Item>
              <Dropdown.Item disabled={localSub.source === "mail"}
                             onClick={() => updateSub(localSub, {source: "mail"})}>{t('source_option_mail')}</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </td>
        <td colSpan={2} className={"text-center"}>
          {localSub.matcher &&
              <Button variant={"secondary"} size={"sm"} onClick={freeUpMatcher}>{t('set_submission_free')}</Button>}
        </td>
        <td colSpan={2} className={"text-center"}>
          {localSub.coordinator &&
              <Button variant={"secondary"} size={"sm"} onClick={freeUpCoord}>{t('set_connection_free')}</Button>}
        </td>
      </tr>}
      </tbody>
    </Table>
    <p className="sub-id">{t('received_at', {timestamp: localSub.created})}</p>
  </div>;
}
