import React, {useEffect, useMemo, useRef, useState} from "react";
import {RESOURCE_MAP, ResourceRow, shortCols} from "./ResourceRow";
import {Pagination} from "react-bootstrap";
import {Search, SortDown, SortUp} from "react-bootstrap-icons";
import Select from "react-dropdown-select";
import {getCookie} from "../scripts/utils";
import {toast, ToastContainer} from "react-toastify";
import {orderBy} from "lodash";
import {SubmissionRow} from "./SubmissionRow";
import BootstrapSwitchButton from "bootstrap-switch-button-react";
import {LoadingSpinner} from "./Shared";
import {QuickFilter} from "./QuickFilter";

const SHOW_NUMBER = 50;

const ColumnHeader = ({col, sortHandler, isSorting, sortDirection, filterData}) => {
  const iconClass = isSorting ? "sort-active" : "sort-muted";

  const classes = ["col-head", "col", `col-${col.fieldName.replace(/_/g, '-')}`];
  if (shortCols.includes(col.fieldName)) {
    classes.push("col-short");
  }

  return <div className={classes.join(' ')}>
    <div className={'top'}>
      <span className="col-head-display-wrapper">
        {col.emoji && <span className="col-head-emoji">{col.emoji}</span>}
        {col.display}
      </span>
      {sortDirection === "asc" ?
        <SortUp className={iconClass} onClick={() => sortHandler(col.fieldName)}/> : <SortDown
            className={iconClass} onClick={() => sortHandler(col.fieldName)}/>}
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

export const ResourceList = ({initialResources, sub, subHandler, user, clearActiveSub, isLoading}) => {
  const [resources, setResources] = useState(initialResources);
  const [visibleResources, setVisibleResources] = useState(resources);
  const [onlyWarsaw, setOnlyWarsaw] = useState(false);
  const [onlyAvailable, setOnlyAvailable] = useState(true);
  const [hotTopic, setHotTopic] = useState(false);
  const [turtleFilter, setTurtleFilter] = useState(false);
  const [peopleFilter, setPeopleFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("hot_sort");
  const [sortOrder, setSortOrder] = useState("desc");
  const [activeSub] = useState(sub);
  const [page, setPage] = useState(1);
  const resourceList = useRef(null);

  const lastPage = useMemo(() => Math.ceil(visibleResources.length / SHOW_NUMBER), [visibleResources]);

  useEffect(() => {
    setResources(initialResources);
  }, [initialResources]);

  useEffect(() => {
    resourceList.current.scroll(0, 0);
  }, [page]);

  const [columnsData] = useState({
    name: {fieldName: 'name', display: "Imie", emoji: "👱", sort: "asc"},
    address: {fieldName: 'address', display: "Adres", emoji: "🏘", sort: "asc"},
    people_to_accommodate: {fieldName: 'people_to_accommodate', display: "Ilu ludzi?", emoji: "👨‍👩‍👧‍👦", sort: "asc"},
    accommodation_length: {fieldName: 'accommodation_length', display: "Na jak długo?", emoji: "🕙", sort: "asc"},
    resource: {fieldName: 'resource', display: "Zasób", emoji: "🛏", sort: "asc"},
    availability: {fieldName: 'availability', display: "Od kiedy?", emoji: "📆", sort: "asc"},
    status: {fieldName: 'hot_sort', display: "Gorącość", emoji: "🌡", sort: "desc"},
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

  const isHot = (resource) => {
    return resource.is_dropped || resource.is_ready;
  };

  useEffect(() => {
    setVisibleResources(
        orderBy(
            resources
                .filter(r => onlyWarsaw ? isInWarsaw(r) : true)
                .filter(r => onlyAvailable ? isAvailable(r) : true)
                .filter(r => peopleFilter ? peopleFilter.includes(r.people_to_accommodate) : true)
                .filter(r => statusFilter ? statusFilter.includes(r.resource) : true)
                .filter(r => hotTopic ? isHot(r) : true)
                .filter(r => turtleFilter ? r.turtle : true)
                .filter(r => searchQuery ? resourceAsString(r).search(searchQuery) > -1 : true),
            [sortBy, "id"], [sortOrder, "asc"]));
  }, [onlyWarsaw, onlyAvailable, peopleFilter, statusFilter, hotTopic, searchQuery, turtleFilter, resources]);

  useEffect(() => {
    setPage(1);
  }, [onlyWarsaw, onlyAvailable, peopleFilter, statusFilter, hotTopic, searchQuery, turtleFilter]);

  useEffect(() => {
    setVisibleResources(vr => orderBy(vr, [sortBy, "id"], [sortOrder, "asc"]));
    setPage(1);
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
        <div className={"mx-5"}>
          {activeSub && <SubmissionRow sub={activeSub} activeHandler={subHandler} user={user} isActive={true}/>}
        </div>
        <div className="quick-filters px-5">
          <QuickFilter label={"Na terenie warszawy"}>
            <BootstrapSwitchButton
                size={"sm"}
                checked={onlyWarsaw}
                onChange={(checked) => {
                  setOnlyWarsaw(checked);
                }}
            />
          </QuickFilter>
          <QuickFilter label={"Przyjmują od dzisiaj"}>
            <BootstrapSwitchButton
                size={"sm"}
                checked={onlyAvailable}
                onChange={(checked) => {
                  setOnlyAvailable(checked);
                }}
            />
          </QuickFilter>
          <QuickFilter label={"Gorącość"}>
            <BootstrapSwitchButton
                size={"sm"}
                checked={hotTopic}
                onChange={(checked) => {
                  setHotTopic(checked);
                }}
            />
          </QuickFilter>
          <QuickFilter label={"Żółwie"}>
            <BootstrapSwitchButton
                size={"sm"}
                checked={turtleFilter}
                onChange={(checked) => {
                  setTurtleFilter(checked);
                }}
            />
          </QuickFilter>
          <QuickFilter label={"Szukaj"}>
            <div className={"d-flex align-items-center"}>
              <Search/>
              <input className="search-input" onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}/>
            </div>
          </QuickFilter>
        </div>
        <div className={"d-flex justify-content-between align-items-center mx-5"}>
          <div>
            <p>{`${visibleResources.length} zasobów`}</p>
          </div>
          <div className="mt-2">
            <Pagination>
              <Pagination.First disabled={page <= 1} onClick={() => setPage(1)}/>
              <Pagination.Prev disabled={page <= 1} onClick={() => setPage(p => p - 1)}/>
              <Pagination.Item active>{page}</Pagination.Item>
              <Pagination.Next disabled={page >= lastPage} onClick={() => setPage(p => p + 1)}/>
              <Pagination.Last disabled={page >= lastPage} onClick={() => setPage(lastPage)}/>
            </Pagination>
          </div>
        </div>
        <div className="resource-list-table mx-2">
          <div className={"column-headers mt-3"}>
            <div className={"col dol-head r-id-col"}>ID</div>
            {Object.values(columnsData).map(colData => <
                ColumnHeader col={colData} key={colData.fieldName} sortHandler={handleSort}
                            sortDirection={sortOrder} isSorting={sortBy === colData.fieldName}
                            filterData={filters[colData.fieldName]}
            />)}
          </div>
          <div className="resource-rows" ref={resourceList}>
            {isLoading ? <LoadingSpinner/> : visibleResources.slice(SHOW_NUMBER * (page - 1), SHOW_NUMBER * page).map(
                r => <ResourceRow resource={r} isExpanded={false}
                                  key={r.id} onMatch={matchFound} user={user}
                                  activeSub={activeSub}
                />)}
          </div>
      </div>
      </>

  );

};
