import "../styles/resources.scss";
import React, {useEffect, useState} from 'react'; // eslint-disable-line
import ReactDOM from 'react-dom';
import {Button, Table} from "react-bootstrap";
import {SortUp, SortDown, Filter, Search} from "react-bootstrap-icons";
import BootstrapSwitchButton from 'bootstrap-switch-button-react';
import {orderBy} from "lodash";
import Select from "react-dropdown-select";


const VISIBLE = [
    "name", "zip_code", "people_to_accommodate", "availability", "accommodation_length",
];

const STATUS_OPTIONS = [
  {label: "Nowy", value: "new"},
  {label: "Wiśnia", value: "verified"},
  {label: "W procesie", value: "processing"},
  {label: "Zajęta", value: "taken"},
  {label: "Zignoruj", value: "ignore"},
];

const ResourceRow = ({resource, isExpanded}) => {
  const [expanded, setExpanded] = useState(isExpanded);

  useEffect(() => {
    return () => {
      setExpanded(isExpanded);
    };
  }, [isExpanded]);

  const updateStatus = (value) => {
    console.log("Status updated: ", value);
  };

  return <div className={`resource-row row-${resource.status}`}>
    <div className={"base-content"}>
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
    {expanded && <div>
      <Table bordered>
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
          <th>Adres</th>
          <td>{resource.address}</td>
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
        </tbody>
      </Table>

    </div>}
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
      {filterData && <Filter style={{cursor: 'pointer'}} onClick={() => setShowFilter(f => !f)}/>}
    </div>
    {filterData &&
        <div className={'filter'}>
          <Select
              className={showFilter ? "" : "hide"}
              multi
              options={[...filterData.options].map(o => ({label: o, value: o}))}
              onChange={filterData.handler}
          />
        </div>
    }
  </div>;
};

const ResourceList = ({resources}) => {
  const [visibleResources, setVisibleResources] = useState(resources);
  const [onlyWarsaw, setOnlyWarsaw] = useState(false);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [peopleFilter, setPeopleFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [expandAll, setExpandAll] = useState(false);

  const [columnsData] = useState({
    name: {fieldName: 'name', display: "Imie", sort: "asc"},
    zip_code: {fieldName: 'zip_code', display: "Kod Pocztowy", sort: "asc"},
    people_to_accommodate: {fieldName: 'people_to_accommodate', display: "Ilu ludzi przyjmie?", sort: "asc"},
    availability: {fieldName: 'availability', display: "Kiedy?", sort: "asc"},
    accommodation_length: {fieldName: 'accommodation_length', display: "Na jak długo?", sort: "asc"},
    status: {fieldName: 'status', display: "Status", sort: "asc"},

  });

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
        resources.filter(
            r => onlyWarsaw ? isInWarsaw(r) : true
        ).filter(
            r => onlyAvailable ? isAvailable(r) : true
        ).filter(
            r => peopleFilter ? peopleFilter.includes(r.people_to_accommodate) : true
        ).filter(
            r => searchQuery ? resourceAsString(r).search(searchQuery) > -1 : true
        )
    );
  }, [onlyWarsaw, onlyAvailable, peopleFilter, searchQuery]);
  useEffect(() => {
    setVisibleResources(
        vr => orderBy(vr, [sortBy], [sortOrder])
    );
  }, [sortBy, sortOrder]);

  const peopleFilterData = {
    handler: (values) => values.length ? setPeopleFilter(values.map(v => v.value)) : setPeopleFilter(null),
    options: new Set(resources.map(r => r.people_to_accommodate))
  };

  return (
      <>
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
              <Search />
              <input className="search-input" onChange={
                (e) => setSearchQuery(e.target.value.toLowerCase())
              } />
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
                           filterData={colData.fieldName === "people_to_accommodate"? peopleFilterData : null}
          />)}
        </div>
        {visibleResources.map(r => <ResourceRow resource={r} isExpanded={expandAll} key={r.id}/>)}
      </>

  );

};

ReactDOM.render(
    React.createElement(ResourceList, window.props),    // gets the props that are passed in the template
    window.react_mount,                                // a reference to the #react div that we render to
);
