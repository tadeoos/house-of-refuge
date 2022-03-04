import "../styles/resources.scss";
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'; // eslint-disable-line
import ReactDOM from 'react-dom';
import {Button, Table, Modal} from "react-bootstrap";
import {SortUp, SortDown, Filter, Search} from "react-bootstrap-icons";
import BootstrapSwitchButton from 'bootstrap-switch-button-react';
import {isEqual, orderBy} from "lodash";
import Select from "react-dropdown-select";
import {getCookie} from "./utils";
import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const updateResource = (resource, fields) => {
  console.log('resource update: ', fields);
  fetch(`/api/resource/update/${resource.id}`, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    headers: {
      'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken')
    }, body: JSON.stringify({fields: fields}) // body data type must match "Content-Type" header
  }).then(response => response.json()).then(data => {
    console.log('Response: ', data);
    if (data.message) {
      toast(`${data.message}`, {type: data.status});
    }
  }).catch((error) => {
    console.error('Error:', error);
  });
};


const MatchModal = ({showModal, handleClose, matchHandle, resource}) => {

  const [dateSet, setDateSet] = useState(null);


  const match = (transport) => {
    const payload = {transport: transport, newDate: dateSet};
    matchHandle(resource, payload);
    handleClose();
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setDateSet(newDate);
    // updateResource(resource, {"availability": newDate});
  };

  return (
      <Modal show={showModal} onHide={handleClose} className="" dialogClassName="">
        <Modal.Body className={"text-center"}>
          <h5>Od Kiedy host będzie znów dostępny?</h5>
          <div style={{margin: "30px"}}>
            <input required type="date" min={new Date().toJSON().slice(0, 10)} value={dateSet}
                   onChange={handleDateChange}/>
          </div>
          <h5>Co z transportem?</h5>
          <div className="transport-btns">
            <Button variant="info" disabled={!dateSet} onClick={() => match(true)}>
              Host przyjedzie na dworzec
            </Button>
            <Button variant="warning" disabled={!dateSet} onClick={() => match(false)}>
              My musimy ogarnąć
            </Button>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
  );
};

export const EditableField = ({value, classes = '', noEditClasses = '', onRename}) => {

  const [editable, setEditable] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editable) {
      inputRef.current.focus();
    } else if (currentValue !== value) {
      onRename(currentValue);
    }
  }, [editable]);

  const keyUpHandler = (event) => {
    if (event.keyCode === 13) {  // enter
      inputRef.current.blur();
    }
  };

  return (editable ? <div className={classes} style={{display: editable ? "" : "none"}}
                          onBlur={() => setEditable(false)}>
            <textarea className="form-control" value={currentValue} ref={inputRef}
                      placeholder="add note..."
                      onChange={(e) => setCurrentValue(e.target.value)}
                      onKeyUp={keyUpHandler}/></div> : <div className="rename-input" onClick={() => setEditable(true)}>
    <span className={value ? "" : "text-muted"}>{value || "kliknij by dodać notatke..."}</span>
  </div>);

};

const VISIBLE = ["name", "full_address", "people_to_accommodate", "accommodation_length", "resource"];

const STATUS_OPTIONS = [{label: "Nowy", value: "new"},
  {label: "Zajęta", value: "taken"}, {label: "Zignoruj", value: "ignore"},];

const STATUS_MAP = {
  "new": "nowy", 'processing': "w procesie", "taken": "Zajęta", "ignore": "Zignoruj",
};

const RESOURCE_MAP = {
  "home": "Dom",
  "flat": "Mieszkanie",
  "room": "Pokój",
  "couch": "Kanapa",
  "mattress": "Materac"
};

const getResourceDisplay = (r) => {
  return RESOURCE_MAP[r] || r;
};

const getPickUpDisplay = (v) => {
  return v ? "Przyjedzie" : "My musimy zawieźć";
};

const ResourceRow = ({resource, isExpanded, onMatch, compact = false}) => {
  const [expanded, setExpanded] = useState(isExpanded);
  const [showModal, setShowModal] = useState(false);
  useEffect(() => {
    return () => {
      setExpanded(isExpanded);
    };
  }, [isExpanded]);

  const updateNote = (value) => {

    fetch(`/api/update_note/${resource.id}`, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken')
      }, body: JSON.stringify({"note": value}) // body data type must match "Content-Type" header
    }).then(response => response.json()).then(data => {
      console.log('Response: ', data);
      // toast(`${data.message}`, {type: data.status});
    }).catch((error) => {
      console.error('Error:', error);
    });
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    updateResource(resource, {"availability": newDate});
  };

  return <div className={`resource-row`}>
    <div className={`base-content row-${resource.status}
      ${resource.verified ? "row-verified" : ""} ${resource.cherry ? "row-cherry" : ""}
      ${resource.is_dropped ? "row-dropped" : ""}
      `}>
      <div className={"col r-id-col"}>{resource.id}</div>
      {VISIBLE.map(
          (a) => <div onClick={() => setExpanded(e => !e)} className={"col"}
                      key={`${resource.id}-${a}`}>{getResourceDisplay(resource[a])}</div>)}
      <div className={"col"}>
        {compact ? getPickUpDisplay(resource.will_pick_up_now) : resource.is_prio ? "GOTOWY": ""}
      </div>
      {/*<div className={`col`}>*/}
      {/*  <Select*/}
      {/*      values={STATUS_OPTIONS.filter((o) => o.value === resource.status)}*/}
      {/*      options={STATUS_OPTIONS}*/}
      {/*      onChange={updateStatus}*/}
      {/*  />*/}
      {/*</div>*/}
    </div>
    {expanded && <div className="row-expanded">
      <Table bordered style={{borderColor: 'black'}}>
        <tbody>
        <tr>
          <th>Coś o sobie</th>
          <td>{resource.about_info}</td>
          <th>Zasób</th>
          <td>{resource.resource}</td>
        </tr>
        <tr>
          <th>Miasto i kod</th>
          <td>{resource.city_and_zip_code}</td>
          <th>Koszty</th>
          <td>{resource.costs}</td>
        </tr>
        <tr>
          <th>Info o miejscu</th>
          <td>{resource.details}</td>
          <th>Transport</th>
          <td>{resource.transport}</td>
        </tr>
        <tr>
          <th>Telefon</th>
          <td>{resource.phone_number}</td>
          <th>Telefon awaryjny</th>
          <td>{resource.backup_phone_number}</td>
        </tr>
        <tr>
          <th>Email</th>
          <td>{resource.email}</td>
          <th>Dodatkowe uwagi</th>
          <td>{resource.extra}</td>
        </tr>
        <tr>
          <th>Notatka</th>
          {compact ? <td>{resource.note}</td> :
              <>
                <td><EditableField value={resource.note} onRename={updateNote}/></td>
                <td colSpan="2"><Button size={"sm"} onClick={() => setShowModal(true)}>ZGODZIŁ SIĘ PRZYJĄC</Button></td>
              </>
          }
        </tr>
        </tbody>
      </Table>

    </div>}
    <MatchModal showModal={showModal} handleClose={() => setShowModal(false)} resource={resource}
                matchHandle={onMatch}/>
  </div>;
};


const ColumnHeader = ({col, sortHandler, isSorting, sortDirection, filterData}) => {
  const iconClass = isSorting ? "sort-active" : "sort-muted";
  const [showFilter, setShowFilter] = useState(false);

  return <div className={"col-head col"}>
    <div className={'top'}>
      {col.display} {sortDirection === "asc" ?
        <SortUp className={iconClass} onClick={() => sortHandler(col.fieldName)}/> : <SortDown
            className={iconClass} onClick={() => sortHandler(col.fieldName)}/>}
      {/*{filterData && <Filter style={{cursor: 'pointer'}} onClick={() => setShowFilter(f => !f)}/>}*/}
    </div>
    {filterData && <div className={'filter'}>
      <Select
          placeholder={"wszystko"}
          multi
          clearable
          options={filterData.options}
          onChange={filterData.handler}
      />
    </div>}
  </div>;
};

const ResourceList = ({initialResources, sub, subHandler, user, clearActiveSub}) => {
  const [resources, setResources] = useState(initialResources);
  const [visibleResources, setVisibleResources] = useState(resources);
  const [onlyWarsaw, setOnlyWarsaw] = useState(false);
  const [onlyAvailable, setOnlyAvailable] = useState(true);
  const [peopleFilter, setPeopleFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("is_prio");
  const [sortOrder, setSortOrder] = useState("desc");
  const [expandAll, setExpandAll] = useState(false);
  const [dataSemaphore, setDataSemaphore] = useState(true);
  const [activeSub] = useState(sub);

  const [columnsData] = useState({
    name: {fieldName: 'name', display: "Imie", sort: "asc"},
    address: {fieldName: 'address', display: "Adres", sort: "asc"},
    people_to_accommodate: {fieldName: 'people_to_accommodate', display: "Ilu ludzi przyjmie?", sort: "asc"},
    accommodation_length: {fieldName: 'accommodation_length', display: "Na jak długo?", sort: "asc"},
    resource: {fieldName: 'resource', display: "Zasób", sort: "asc"},
    is_prio: {fieldName: 'is_prio', display: "Gotowy?", sort: "asc"},

  });

  const matchFound = (resource, payload) => {
    fetch(`/api/match_found`, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken')
      }, body: JSON.stringify({resource: resource.id, sub: sub.id, ...payload}) // body data type must match "Content-Type" header
    }).then(response => response.json()).then(data => {
      console.log('Response: ', data);
      toast(`${data.message}`, {type: data.status});
      clearActiveSub();
    }).catch((error) => {
      toast(`${error}`, {type: "error"});
      console.error('Error:', error);
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setDataSemaphore((s) => !s);
    }, getRandomInt(5000, 1000));
    return () => clearInterval(interval);
  }, []);

  useEffect(async () => {
    const response = await fetch(`/api/zasoby`);
    const result = await response.json();
    if (isEqual(resources, result.data)) {
      console.log("THEY ARE EQUALL");
      return;
    }
    setResources(result.data);
  }, [dataSemaphore]);

  const resourceAsString = (r) => {
    return Object.values(r).join(' ').toLowerCase();
  };

  const handleSort = (column) => {
    setSortBy(column);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const isInWarsaw = (resource) => {
    return ["00", "01", "02", "03", "04", "05"].includes(resource.zip_code.slice(0, 2));
  };

  const isAvailable = (resource) => {
    return new Date(resource.availability) <= Date.now();
  };

  useEffect(() => {
    setVisibleResources(orderBy(resources.filter(r => onlyWarsaw ? isInWarsaw(r) : true).filter(r => onlyAvailable ? isAvailable(r) : true).filter(r => peopleFilter ? peopleFilter.includes(r.people_to_accommodate) : true).filter(r => statusFilter ? statusFilter.includes(r.resource) : true).filter(r => searchQuery ? resourceAsString(r).search(searchQuery) > -1 : true), [sortBy], [sortOrder]));
  }, [onlyWarsaw, onlyAvailable, peopleFilter, statusFilter, searchQuery, resources]);

  useEffect(() => {
    setVisibleResources(vr => orderBy(vr, [sortBy], [sortOrder]));
  }, [sortBy, sortOrder]);

  const peopleFilterData = useMemo(() => {
    return {
      handler: (values) => values.length ? setPeopleFilter(values.map(v => v.value)) : setPeopleFilter(null),
      options: [...new Set(resources.map(r => r.people_to_accommodate))].map(o => ({label: o, value: o}))
    };
  }, [resources]);


  const statusFilterData = useMemo(() => {
    return {
      handler: (values) => values.length ? setStatusFilter(values.map(v => v.value)) : setStatusFilter(null),
      options: [...new Set(resources.map(r => r.resource))].map(v => ({value: v, label: RESOURCE_MAP[v]}))
    };
  }, [resources]);

  const filters = {
    "people_to_accommodate": peopleFilterData, "resource": statusFilterData,
  };

  return (<>
        <ToastContainer autoClose={2000}/>
        {activeSub && <div>
          <SubmissionRow sub={activeSub} activeHandler={subHandler} user={user} isActive={true}/>
        </div>}
        <Table>
          <tbody>
          <tr>
            <th>Szybkie filtry</th>
            <td>Na terenie warszawy</td>
            <td>
              <BootstrapSwitchButton
                  size={"sm"}
                  checked={onlyWarsaw}
                  onChange={(checked) => {
                    setOnlyWarsaw(checked);
                  }}
              /></td>
            <td>Przyjmują od dzisiaj</td>
            <td>
              <BootstrapSwitchButton
                  size={"sm"}
                  checked={onlyAvailable}
                  onChange={(checked) => {
                    setOnlyAvailable(checked);
                  }}
              /></td>
            <td>
              <Search/>
              <input className="search-input" onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}/>
            </td>
            <td><Button size={"sm"} onClick={() => setExpandAll(ea => !ea)}>Expand all</Button></td>
          </tr>
          </tbody>
        </Table>

        {/*<Button>Do odbioru dzisiaj</Button>*/}
        {/*<Button>Na terenie warszawy</Button>*/}
        <div>
          <p>{`${visibleResources.length} zasóbów ${visibleResources.length > 150 ? "(pokazuje pierwsze 150 wyników)" : ""}`}</p>
        </div>
        <div className={"column-headers mt-3"}>
          <div className={"col dol-head r-id-col"}>ID</div>
          {Object.values(columnsData).map(colData => <
              ColumnHeader col={colData} key={colData.fieldName} sortHandler={handleSort}
                           sortDirection={sortOrder} isSorting={sortBy === colData.fieldName}
                           filterData={filters[colData.fieldName]}
          />)}
        </div>
        {visibleResources.slice(0, 150).map(r => <ResourceRow resource={r} isExpanded={expandAll}
                                                              key={r.id} onMatch={matchFound}/>)}
      </>

  );

};


const SOURCE_OPTIONS = [{label: "Strona", value: "webform"}, {label: "Mail", value: "mail"}, {
  label: "Teren",
  value: "terrain"
}, {label: "Inne", value: "other"},];


const SUB_STATE_OPTIONS = [
  {value: "new", label: "Świeżak"},
  {value: "searching", label: "Szukamy"},
  {value: "in_progress", label: "Host znaleziony"},
  {value: "gone", label: "Zniknęła"},
  {value: "success", label: "Sukces"},
  {value: "cancelled", label: "Nieaktualne"},
];

const getStatusDisplay = (status) => {
  const option = SUB_STATE_OPTIONS.filter(o => o.value === status)[0];
  return option.label;
};

const SUB_COLUMNS = ["status", "kto ogarnia w bazie", "zgłoszenie bezpośrednie czy przez kogoś (kontakt do łącznika)", "ile osób", "Imię i nazwisko", "Telefon bezpośredni do potrzebującego", "kto tam jest (jaki skład),czy mamy ogarniac dla nich transport", "kiedy w PL", "na jak długo", "dodatkowe informacje o potrzebujących", "osoba kontaktowa (nocleg)", "nr telefonu", "czy zapewnia transport (tak/nie)", "UWAGI",];


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


function SubmissionRow({sub, activeHandler, user, isActive = false}) {

  const isOwner = user.id === sub.matcher?.id;
  const isCoordinator = user.id === sub.coordinator?.id;
  const isGroupAdmin = user.coordinator;
  const [status, setStatus] = useState(sub.status);
  const [note, setNote] = useState(sub.note);

  const btnHandler = () => {
    console.log("btn handler clicked");
    activeHandler(sub, isActive);
  };

  const getActionBtn = () => {
    if (sub.status === "in_progress") {
      if (sub.coordinator) {
        return isCoordinator ? "" : <Button size={"sm"} disabled>{sub.coordinator.display}</Button>;
      } else {
        return <Button size={"sm"} onClick={setCoordinator}>Przypisz do siebie</Button>;
      }
    } else if (sub.status === "searching" && !isOwner) {
      return "";
    } else if (sub.matcher && !isActive && !isOwner) {
      return <Button size={"sm"} disabled>{sub.matcher.display}</Button>;
    } else {
      return <Button size={"sm"} onClick={btnHandler}>{isActive ? "Zwolnij" : "Szukaj Hosta"}</Button>;
    }
  };

  const updateStatus = (value) => {
    console.log("Updating sub value: ", value);
    const newStatus = value[0].value;
    if (newStatus !== sub.status) {
      updateSub(sub, {"status": newStatus}, () => setStatus(newStatus));
    } else {
      console.log("would update but we're smart now..");
    }
  };

  const freeUpMatcher = () => {
    updateSub(sub, {"matcher": null, "status": "new"}, () => setStatus("new"));
  };

  const freeUpCoord = () => {
    updateSub(sub, {"coordinator": null}, ()=>null);
  };


  const setCoordinator = () => {
    console.log("sub status update");
    fetch(`/api/sub/update/${sub.id}`, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken')
      }, body: JSON.stringify({fields: {"coordinator_id": user.id}}) // body data type must match "Content-Type" header
    }).then(response => response.json()).then(data => {
      console.log('Response: ', data);
      // toast(`${data.message}`, {type: data.status});
    }).catch((error) => {
      console.error('Error:', error);
    });
  };

  return <div
      className={`submission-row sub-${sub.status.replace("_", "-")} ${sub.accomodation_in_the_future ? "sub-in-future" : ""}`}>
    <p className='sub-id'>ID ZGŁOSZENIA: {sub.id}</p>
    <Table className="sub-table">
      <tbody>
      <tr>
        <th>Imie</th>
        <td>{sub.name}</td>
        <th>Ile Osób?</th>
        <td>{sub.people}</td>
        <th>Jak dlugo?</th>
        <td>{sub.how_long}</td>
        <th>Telefon</th>
        <td>{sub.phone_number}</td>
      </tr>
      <tr>
        <th>Od Kiedy?</th>
        <td>{sub.when}</td>
        <th>Opis:</th>
        <td>{sub.description}</td>
        <th>Języki</th>
        <td>{sub.languages}</td>
        <th>Narodowość</th>
        <td>{sub.origin}</td>
      </tr>
      <tr>
        <th>Ma zwierzęta</th>
        <td>{sub.traveling_with_pets}</td>
        <th>Czy może spać ze zwierzętami?</th>
        <td>{sub.can_stay_with_pets}</td>
        <th>Potrzebuje transportu?</th>
        <td>{sub.transport_needed ? "tak" : "nie"}</td>
        <th>Notka</th>
        <td><EditableField value={note} onRename={(note) => updateSub(sub, {"note": note}, () => setNote(note))}/></td>
      </tr>
      {sub.resource && <tr className="tr-host">
        <th>HOST</th>
        <td>{sub.resource.name}</td>
        <td>{sub.resource.address}</td>
        <td>{sub.resource.phone_number}</td>
        <td>{getPickUpDisplay(sub.resource.will_pick_up_now)}</td>
        <td colSpan={3}>{sub.resource.note}</td>
      </tr>}
      <tr>
        <th>Osoba zgłaszająca:</th>
        <td>{sub.receiver?.display || sub.contact_person}</td>
        <th>Hosta {["searching", "new"].includes(sub.status) ? "szuka" : "znalazł"}:</th>
        <td>{sub.matcher?.display || getActionBtn()}</td>
        <th>Łącznik:</th>
        <td>{sub.coordinator?.display || (sub.matcher ? getActionBtn() : "")}</td>
        <th>
          status
        </th>
        <td>
          {isCoordinator || isGroupAdmin ? <Select
              values={SUB_STATE_OPTIONS.filter((o) => o.value === status)}
              options={SUB_STATE_OPTIONS}
              onChange={updateStatus}
          /> : getStatusDisplay(status)
          }
        </td>
      </tr>
      {
          isGroupAdmin && !isActive && <tr>
            <th>Akcje koordynatora</th>
            <td colSpan={6}>
              <div className={"d-flex justify-content-evenly"}>
                {sub.matcher && <Button variant={"warning"}  size={"sm"} onClick={freeUpMatcher}>Zwolnij zgłoszenie</Button>}
                {sub.coordinator && <Button variant={"warning"} size={"sm"} onClick={freeUpCoord}>Zwolnij łącznika</Button>}
              </div>
            </td>
          </tr>
      }
      </tbody>
    </Table>
    <p className='sub-id'>Przyjęte: {sub.created}</p>
  </div>;
}

const DroppedHost = ({resource}) => {
  return <div className={"dropped-row"}>
    {/*<p>{resource.compact_display}</p>*/}
    <ResourceRow resource={resource} compact={true}/>
  </div>;
};

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}


const getLatestSubId = async () => {
  const response = await fetch(`/api/latest/subs/`);
  const result = await response.json();
  return result.id;
};


const SubmissionList = ({user, subs, btnHandler, sourceFilter,
                          setStatusFilter, setSourceFilter, statusFilter, droppedFilter, setDropped
}) => {
  const [submissions, setSubmissions] = useState(subs);
  const [droppedHosts, setDroppedHosts] = useState([]);
  const [visibleSubmissions, setVisibleSubmissions] = useState(submissions);
  const [searchQuery, setSearchQuery] = useState("");
  const [userOnly, setUserOnly] = useState(false);
  const [dataSemaphore, setDataSemaphore] = useState(true);
  const [latestChange, setLatestChange] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDataSemaphore((s) => !s);
    }, getRandomInt(1000, 1300));
    return () => clearInterval(interval);
  }, []);

  useEffect(async () => {
    const latest = await getLatestSubId();
    if (latest > latestChange) {
      setLatestChange(latest);
    }
  }, [dataSemaphore]);

  useEffect(async () => {
    const response = await fetch(`/api/zgloszenia`);
    const result = await response.json();
    console.log("got data", result.data);
    setSubmissions(result.data.submissions);
    // do latest for dropped
    setDroppedHosts(result.data.dropped);
  }, [latestChange]);


  const subBelongsToUser = (s) => {
    if (s.receiver?.id === user.id) {
      return true;
    }
    if (s.matcher?.id === user.id) {
      return true;
    }
    if (s.coordinator?.id === user.id) {
      return true;
    }
    return false;
  };

  useEffect(() => {
    setVisibleSubmissions(
        submissions.filter(
            s => sourceFilter.length ? sourceFilter.map(o => o.value).includes(s.source) : true
        ).filter(
            s => statusFilter.length ? statusFilter.map(o => o.value).includes(s.status) : true
        ).filter(
            s => userOnly ? subBelongsToUser(s) : true
        ).filter(
            s => searchQuery ? Object.values(s).join(' ').toLowerCase().search(searchQuery) > -1 : true
        )
    );
  }, [sourceFilter, statusFilter, submissions, searchQuery, userOnly]);

  // useEffect(() => {
  //   setVisibleResources(
  //       vr => orderBy(vr, [sortBy], [sortOrder])
  //   );
  // }, [sortBy, sortOrder]);

  const filterSource = (values) => {
    console.log(values);
    if (values.length) {
      setSourceFilter(values);
    } else {
      setSourceFilter([]);
    }
  };

  const filterStatus = (values) => {
    console.log(values);
    if (values.length) {
      setStatusFilter(values);
    } else {
      setStatusFilter([]);
    }
  };

  return (<>
        <ToastContainer autoClose={2000}/>
        <Table>
          <tbody>
          <tr>
            <th>Szybkie filtry</th>
            <td>
              żródło
            </td>
            <td>
              <Select
                  multi
                  values={sourceFilter}
                  options={SOURCE_OPTIONS}
                  onChange={filterSource}
              />
            </td>
            <td>
              status
            </td>
            <td>
              <Select
                  multi
                  values={statusFilter}
                  options={SUB_STATE_OPTIONS}
                  onChange={filterStatus}
              />
            </td>
            <td>
              zniknięte
            </td>
            <td>
              <BootstrapSwitchButton
                  size={"sm"}
                  checked={droppedFilter}
                  onChange={(checked) => {
                    setDropped(checked);
                  }}
              /></td>
            <td>Tylko moje</td>
            <td>
              <BootstrapSwitchButton
                  size={"sm"}
                  checked={userOnly}
                  onChange={(checked) => {
                    setUserOnly(checked);
                  }}
              /></td>
            <td>
              <Search/>
              <input className="search-input" onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}/>
            </td>
          </tr>
          </tbody>
        </Table>

        <div><p>{`${visibleSubmissions.length} zgłoszeń`}</p></div>
        {/*<div className={"column-headers mt-3"}>*/}
        {/*  {SUB_COLUMNS.map(colName => <div className={"col-head col"}>{colName}</div>)}*/}
        {/*</div>*/}

        {droppedFilter && droppedHosts && <div className={"dropped-container"}>{droppedHosts.map(r => <DroppedHost resource={r}
                                                                                                  key={r.id}/>)}</div>}
        {visibleSubmissions.map(s => <SubmissionRow user={user} sub={s} key={s.id} activeHandler={btnHandler}/>)}
      </>

  );

};


const CoordinaotrsHeader = ({coordinators, helped}) => {
  return <>
    <div className="coordinators">
      <div>
        <h5>Koordynaotrzy Zachodni</h5>
        <ol>{(coordinators.station || []).map(c => <li key={c.user.id}>{c.user.display}</li>)}</ol>
      </div>
      <div>
        <h5>Koordynaotrzy Zdalni</h5>
        <ol>{(coordinators.remote || []).map(c => <li key={c.user.id}>{c.user.display}</li>)}</ol>
      </div>
    </div>
    {helped ?
        <div><h5 className="good-message">Pomogliśmy dziś {helped} osobom {"🙏".repeat(Math.floor(helped / 10))}</h5>
        </div> : <></>}
  </>;
};


const App = ({subs, initialResources, userData, coordinators, helped}) => {
  const [activeSub, setActiveSub] = useState(null);
  const [sourceFilter, setSourceFilter] = useState([{label: "Teren", value: "terrain"}]);
  const [statusFilter, setStatusFilter] = useState([]);
  const [droppedFilter, setDroppedFilter] = useState(true);

  const clearActiveSub = () => setActiveSub(null);

  const subIsTaken = (sub, isActive = false) => {
    console.log("sub taken");
    let fields;
    if (isActive) {
      // no match found... we're clearing the status
      fields = {"status": "new", "matcher_id": null};
    } else {
      fields = {"status": "searching", "matcher_id": userData.id};
    }

    fetch(`/api/sub/update/${sub.id}`, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken')
      }, body: JSON.stringify({"fields": fields})
    }).then(response => response.json()).then(data => {
      console.log('Response: ', data);
      // toast(`${data.message}`, {type: data.status});
      if (!isActive) {
        setActiveSub(data.data);
      } else {
        setActiveSub(null);
      }

    }).catch((error) => {
      console.error('Error:', error);
    });
  };


  return <>
    <CoordinaotrsHeader coordinators={coordinators} helped={helped}/>
    {activeSub ? <ResourceList initialResources={initialResources}
                               user={userData} sub={activeSub} subHandler={subIsTaken}
                               clearActiveSub={clearActiveSub}
    /> : <SubmissionList user={userData} subs={subs} btnHandler={subIsTaken}
                         sourceFilter={sourceFilter} setSourceFilter={(v) => setSourceFilter(v)}
                         statusFilter={statusFilter}
                         setStatusFilter={(v) => setStatusFilter(v)}
                         droppedFilter={droppedFilter} setDropped={(v) => setDroppedFilter(v)}
    />
    }
  </>;
};

ReactDOM.render(React.createElement(App, window.props),    // gets the props that are passed in the template
    window.react_mount,                                // a reference to the #react div that we render to
);
