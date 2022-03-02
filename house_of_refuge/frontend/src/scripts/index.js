import "../styles/resources.scss";
import React, {useEffect, useMemo, useRef, useState} from 'react'; // eslint-disable-line
import ReactDOM from 'react-dom';
import {Button, Table, I} from "react-bootstrap";
import {SortUp, SortDown, Filter, Search} from "react-bootstrap-icons";
import BootstrapSwitchButton from 'bootstrap-switch-button-react';
import {isEqual, orderBy} from "lodash";
import Select from "react-dropdown-select";
import {getCookie} from "./utils";
import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export const EditableField = (
    {value, classes = '', noEditClasses = '', onRename}
) => {

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
            <textarea className="form-control rename-input" value={currentValue} ref={inputRef}
                      placeholder="add note..."
                      onChange={(e) => setCurrentValue(e.target.value)}
                      onKeyUp={keyUpHandler}/></div> :
          <div className={noEditClasses}>
            <span className={value ? "" : "text-muted"} onClick={() => setEditable(true)}>{value || "kliknij by dodać notatke..."}</span>
          </div>
  );

};

const VISIBLE = [
  "name", "address", "people_to_accommodate", "availability", "accommodation_length",
];

const STATUS_OPTIONS = [
  {label: "Nowy", value: "new"},
  {label: "Wiśnia", value: "verified"},
  {label: "W procesie", value: "processing"},
  {label: "Zajęta", value: "taken"},
  {label: "Zignoruj", value: "ignore"},
];

const STATUS_MAP = {
  "new": "nowy",
  "verified": "wiśnia",
  'processing': "w procesie",
  "taken": "Zajęta",
  "ignore": "Zignoruj",
};

const ResourceRow = ({resource, isExpanded, statusUpdateHandler}) => {
      const [expanded, setExpanded] = useState(isExpanded);
      useEffect(() => {
        return () => {
          setExpanded(isExpanded);
        };
      }, [isExpanded]);

      const updateStatus = (value) => {
        console.log("Status dropdown updated: ", value);
        statusUpdateHandler(resource, value);
      };

      const updateNote = (value) => {

        fetch(`/api/update_note/${resource.id}`, {
          method: 'POST', // *GET, POST, PUT, DELETE, etc.
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
          },
          body: JSON.stringify({"note": value}) // body data type must match "Content-Type" header
        }).then(response => response.json()
        ).then(data => {
          console.log('Response: ', data);
          toast(`${data.message}`, {type: data.status});
        }).catch((error) => {
          console.error('Error:', error);
        });
      };

      return <div className={`resource-row`}>
        <div className={`base-content row-${resource.status}`}>
          {VISIBLE.map((a) => <div onClick={() => setExpanded(e => !e)} className={"col"}
                                   key={`${resource.id}-${a}`}>{resource[a]}</div>)}
          <div className={`col`}>
            <Select
                values={STATUS_OPTIONS.filter((o) => o.value === resource.status)}
                options={STATUS_OPTIONS}
                onChange={updateStatus}
            />
          </div>
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
              <td><EditableField value={resource.note} onRename={updateNote}/></td>
            </tr>
            </tbody>
          </Table>

        </div>}
      </div>;
    }
;


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
    {filterData &&
        <div className={'filter'}>
          <Select
              placeholder={"wszystko"}
              multi
              clearable
              options={filterData.options}
              onChange={filterData.handler}
          />
        </div>
    }
  </div>;
};

const ResourceList = ({initialResources, sub, subHandler}) => {
  const [resources, setResources] = useState(initialResources);
  const [visibleResources, setVisibleResources] = useState(resources);
  const [onlyWarsaw, setOnlyWarsaw] = useState(false);
  const [onlyAvailable, setOnlyAvailable] = useState(true);
  const [peopleFilter, setPeopleFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [expandAll, setExpandAll] = useState(false);
  const [activeSub] = useState(sub);

  const [columnsData] = useState({
    name: {fieldName: 'name', display: "Imie", sort: "asc"},
    address: {fieldName: 'address', display: "Adres", sort: "asc"},
    people_to_accommodate: {fieldName: 'people_to_accommodate', display: "Ilu ludzi przyjmie?", sort: "asc"},
    availability: {fieldName: 'availability', display: "Kiedy?", sort: "asc"},
    accommodation_length: {fieldName: 'accommodation_length', display: "Na jak długo?", sort: "asc"},
    status: {fieldName: 'status', display: "Status", sort: "asc"},

  });

  const loadData = async () => {
    const response = await fetch(`/api/zasoby`);
    const result = await response.json();
    if (isEqual(resources, result.data)) {
      console.log("THEY ARE EQUALL");
      return;
    }
    setResources(result.data);
  };

  const updateStatus = (resource, value) => {

    const newStatus = value[0];

    if (newStatus.value === resource.status) {
      console.log("Status hasn't changed!");
      return;
    }

    fetch(`/api/update_status/${resource.id}`, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken')
      },
      body: JSON.stringify(newStatus) // body data type must match "Content-Type" header
    }).then(response => response.json()
    ).then(data => {
      console.log('Response: ', data);
      toast(`${data.message}`, {type: data.status});
    }).catch((error) => {
      console.error('Error:', error);
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      loadData();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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
    setVisibleResources(
        orderBy(
            resources.filter(
                r => onlyWarsaw ? isInWarsaw(r) : true
            ).filter(
                r => onlyAvailable ? isAvailable(r) : true
            ).filter(
                r => peopleFilter ? peopleFilter.includes(r.people_to_accommodate) : true
            ).filter(
                r => statusFilter ? statusFilter.includes(r.status) : true
            ).filter(
                r => searchQuery ? resourceAsString(r).search(searchQuery) > -1 : true
            ),
            [sortBy], [sortOrder])
    );
  }, [onlyWarsaw, onlyAvailable, peopleFilter, statusFilter, searchQuery, resources]);
  useEffect(() => {
    setVisibleResources(
        vr => orderBy(vr, [sortBy], [sortOrder])
    );
  }, [sortBy, sortOrder]);

  const peopleFilterData = useMemo(
      () => {
        return {
          handler: (values) => values.length ? setPeopleFilter(values.map(v => v.value)) : setPeopleFilter(null),
          options: [...new Set(resources.map(r => r.people_to_accommodate))].map(o => ({label: o, value: o}))
        };
      }, [resources]);


  const statusFilterData = useMemo(
      () => {
        return {
          handler: (values) => values.length ? setStatusFilter(values.map(v => v.value)) : setStatusFilter(null),
          options: [...new Set(resources.map(r => r.status))].map(v => ({value: v, label: STATUS_MAP[v]}))
        };
      }, [resources]);

  const filters = {
    "people_to_accommodate": peopleFilterData,
    "status": statusFilterData,
  };

  return (
      <>
        <ToastContainer autoClose={2000}/>
        {activeSub && <div>
          <SubmissionRow sub={activeSub} activeHandler={subHandler} isActive={true}/>
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
              <input className="search-input" onChange={
                (e) => setSearchQuery(e.target.value.toLowerCase())
              }/>
            </td>
            <td><Button size={"sm"} onClick={() => setExpandAll(ea => !ea)}>Expand all</Button></td>
          </tr>
          </tbody>
        </Table>

        {/*<Button>Do odbioru dzisiaj</Button>*/}
        {/*<Button>Na terenie warszawy</Button>*/}
        <div><p>{`${visibleResources.length} zasóbów`}</p></div>
        <div className={"column-headers mt-3"}>
          {Object.values(columnsData).map(colData => <
              ColumnHeader col={colData} key={colData.fieldName} sortHandler={handleSort}
                           sortDirection={sortOrder} isSorting={sortBy === colData.fieldName}
                           filterData={filters[colData.fieldName]}
          />)}
        </div>
        {visibleResources.map(r => <ResourceRow resource={r} isExpanded={expandAll} statusUpdateHandler={updateStatus}
                                                key={r.id}/>)}
      </>

  );

};


function SubmissionRow({sub, activeHandler, isOwner, isActive = false}) {

  const btnHandler = () => {
    if (isActive) {
      activeHandler(null);
    } else {
      activeHandler(sub);
    }
  };

  return <div className="submission-row">
    <Table>
      <tbody>
      <tr>
        <th>Imie</th>
        <td>{sub.name}</td>
        <th>Ile Osób</th>
        <td>{sub.people}</td>
        <th>Jak dlugo?</th>
        <td>{sub.how_long}</td>
        <td>
          {sub.owner && !isActive && !isOwner ? <Button disabled>{sub.owner.display}</Button> :
              <Button onClick={btnHandler}>{isActive ? "Zwolnij" : "Szukaj"}</Button>
          }
        </td>
      </tr>
      <tr>
        <th>Kiedy?</th>
        <td>{sub.when}</td>
        <th>Osoba zgłaszająca:</th>
        <td>{sub.contact_person}</td>
        <th>UWAGI</th>
        <td>{sub.note}</td>
      </tr>
      </tbody>
    </Table>
  </div>;
}

const SOURCE_OPTIONS = [
  {label: "Strona", value: "webform"},
  {label: "Mail", value: "mail"},
  {label: "Teren", value: "terrain"},
  {label: "Inne", value: "other"},
];

const SUB_COLUMNS = [
  "status",
  "kto ogarnia w bazie",
  "zgłoszenie bezpośrednie czy przez kogoś (kontakt do łącznika)",
  "ile osób",
  "Imię i nazwisko",
  "Telefon bezpośredni do potrzebującego",
  "kto tam jest (jaki skład),czy mamy ogarniac dla nich transport",
  "kiedy w PL",
  "na jak długo",
  "dodatkowe informacje o potrzebujących",
  "osoba kontaktowa (nocleg)",
  "nr telefonu",
  "czy zapewnia transport (tak/nie)",
  "UWAGI",
];

const SubmissionList = ({user, subs, btnHandler}) => {
  const [submissions, setSubmissions] = useState(subs);
  const [visibleSubmissions, setVisibleSubmissions] = useState(submissions);
  const [sourceFilter, setSourceFilter] = useState(["terrain"]);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async () => {
    const response = await fetch(`/api/zgloszenia`);
    const result = await response.json();
    setSubmissions(result.data);
  };

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     loadData();
  //   }, 1000);
  //   return () => clearInterval(interval);
  // }, []);


  useEffect(() => {
    setVisibleSubmissions(
        submissions.filter(s => sourceFilter.length ? sourceFilter.includes(s.source) : true
        ).filter(
            s => searchQuery ? Object.values(s).join(' ').toLowerCase().search(searchQuery) > -1 : true
        )
    );
  }, [sourceFilter, submissions, searchQuery]);
  // useEffect(() => {
  //   setVisibleResources(
  //       vr => orderBy(vr, [sortBy], [sortOrder])
  //   );
  // }, [sortBy, sortOrder]);

  const filterSource = (values) => {
    console.log(values);
    if (values.length) {
      setSourceFilter(values.map(o => o.value));
    } else {
      setSourceFilter([]);
    }
  };

  return (
      <>
        <ToastContainer autoClose={2000}/>
        <Table>
          <tbody>
          <tr>
            <th>Szybkie filtry</th>
            <td>żródło</td>
            <td>
              <Select
                  multi
                  options={SOURCE_OPTIONS}
                  onChange={filterSource}
              />
            </td>
            <td>
              <Search/>
              <input className="search-input" onChange={
                (e) => setSearchQuery(e.target.value.toLowerCase())
              }/>
            </td>
          </tr>
          </tbody>
        </Table>

        <div><p>{`${visibleSubmissions.length} zgłoszeń`}</p></div>
        {/*<div className={"column-headers mt-3"}>*/}
        {/*  {SUB_COLUMNS.map(colName => <div className={"col-head col"}>{colName}</div>)}*/}
        {/*</div>*/}


        {visibleSubmissions.map(s => <SubmissionRow isOwner={s.owner?.id === user.id} sub={s} key={s.id}
                                                    activeHandler={btnHandler}/>)}
      </>

  );

};


const App = ({subs, initialResources, userData}) => {
  const [activeSub, setActiveSub] = useState(null);

  const subIsTaken = (sub) => {
    fetch(`api/sub_start/${sub.id}`, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken')
      },
      body: JSON.stringify({}) // body data type must match "Content-Type" header
    }).then(response => response.json()
    ).then(data => {
      console.log('Response: ', data);
      // toast(`${data.message}`, {type: data.status});
    }).catch((error) => {
      console.error('Error:', error);
    });
    setActiveSub(sub);
  };

  if (activeSub) {
    return <>
      <ResourceList initialResources={initialResources} sub={activeSub} subHandler={(sub) => setActiveSub(null)}/>
    </>;
  } else {
    return <SubmissionList user={userData} subs={subs} btnHandler={subIsTaken}/>;
  }
};

ReactDOM.render(
    React.createElement(App, window.props),    // gets the props that are passed in the template
    window.react_mount,                                // a reference to the #react div that we render to
);
