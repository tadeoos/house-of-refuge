import React, { useEffect, useMemo, useRef, useState } from "react";
import { SUB_STATE_OPTIONS } from "../scripts/utils";
import { ToastContainer } from "react-toastify";
import Select from "react-dropdown-select";
import BootstrapSwitchButton from "bootstrap-switch-button-react";
import { Search } from "react-bootstrap-icons";
import { LoadingSpinner } from "./Shared";
import { SubmissionRow } from "./SubmissionRow";
import { ResourceRow } from "./ResourceRow";
import { orderBy } from "lodash";
import { QuickFilter } from "./QuickFilter";
import { Pagination } from "react-bootstrap";

export const SOURCE_OPTIONS = [
  { label: "Strona", value: "webform" },
  { label: "Teren", value: "terrain" },
  { label: "Mail", value: "mail" },
  { label: "Inne", value: "other" }
];

const SHOW_NUMBER = 20;

const DroppedHost = ({ resource, isCoordinator }) => {
  return <div className={`dropped-row pick-up-${resource.will_pick_up_now}`}>
    <ResourceRow resource={resource} compact={true} isCoordinator={isCoordinator} />
  </div>;
};


export const SubmissionList = (
  {
    user,
    subs,
    btnHandler,
    sourceFilter,
    setStatusFilter,
    setSourceFilter,
    statusFilter,
    droppedFilter,
    setDropped,
    droppedHosts,
    isCoordinator,
    isLoading,
    userFilterValue, setUserFilter,
    todayFilterValue, setTodayFilter,
    peopleFilter, setPeopleFilter,
    activeNow, setActiveNow,
  }) => {
  const [visibleSubmissions, setVisibleSubmissions] = useState(subs);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const lastPage = useMemo(() => Math.ceil(visibleSubmissions.length / SHOW_NUMBER), [visibleSubmissions]);
  const subsList = useRef(null);

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
    subsList.current.scroll(0, 0);
  }, [page]);


  useEffect(() => {
    setVisibleSubmissions(orderBy(
      subs.filter(
        s => sourceFilter.length ? sourceFilter.map(o => o.value).includes(s.source) : true
      ).filter(s => statusFilter.length ? statusFilter.map(o => o.value).includes(s.status) : true
      ).filter(s => userFilterValue ? subBelongsToUser(s) : true
      ).filter(s => todayFilterValue ? s.is_today : true
      ).filter(s => activeNow ? !s.accomodation_in_the_future : true
      ).filter(s => peopleFilter.length ? peopleFilter.map(o => o.value).includes(s.people_count) : true
      ).filter(s => searchQuery ? Object.values(s).join(' ').toLowerCase().search(searchQuery) > -1 : true),
      ["priority", "id"], ["desc", "asc"])
    );
  }, [sourceFilter, todayFilterValue, peopleFilter, activeNow, statusFilter, subs, searchQuery, userFilterValue]);


  useEffect(() => {
    setPage(1);
  }, [sourceFilter, todayFilterValue, activeNow, peopleFilter, statusFilter, userFilterValue, searchQuery]);

  // useEffect(() => {
  //   setVisibleResources(
  //       vr => orderBy(vr, [sortBy], [sortOrder])
  //   );
  // }, [sortBy, sortOrder]);

  const filterSource = (values) => {
    if (values.length) {
      setSourceFilter(values);
    } else {
      setSourceFilter([]);
    }
  };

  const filterStatus = (values) => {
    if (values.length) {
      setStatusFilter(values);
    } else {
      setStatusFilter([]);
    }
  };

  const peopleStatusChange = (values) => {
    console.log("setting poeople: ", values);
    if (values.length) {
      setPeopleFilter(values);
    } else {
      setPeopleFilter([]);
    }
  };

  return (<>
    <div className={"px-5 border-bottom"}>
      <ToastContainer autoClose={2000} />
      <div className="quick-filters mt-5">
        <QuickFilter label={"Źródło"}>
          <Select
            multi
            values={sourceFilter}
            options={SOURCE_OPTIONS}
            onChange={filterSource}
          />
        </QuickFilter>
        <QuickFilter label={"Status"}>
          <Select
            multi
            values={statusFilter}
            options={SUB_STATE_OPTIONS}
            onChange={filterStatus}
          />
        </QuickFilter>
        <QuickFilter label={"Liczba osób"}>
          <Select
            multi
            values={peopleFilter}
            options={[...new Set(subs.map(s => s.people_count))].map(o => ({ label: o, value: o }))}
            onChange={peopleStatusChange}
          />
        </QuickFilter>
        <QuickFilter label={"Zniknięte"}>
          <BootstrapSwitchButton
            size={"sm"}
            checked={droppedFilter}
            onChange={(checked) => {
              setDropped(checked);
            }}
          />
        </QuickFilter>
        <QuickFilter label={"Przyjęte dzisiaj"}>
          <BootstrapSwitchButton
            size={"sm"}
            checked={todayFilterValue}
            onChange={(checked) => {
              setTodayFilter(checked);
            }}
          />
        </QuickFilter>
        <QuickFilter label={"Aktywne dzisiaj"}>
          <BootstrapSwitchButton
            size={"sm"}
            checked={activeNow}
            onChange={(checked) => {
              setActiveNow(checked);
            }}
          />
        </QuickFilter>
        <QuickFilter label={"Tylko moje"}>
          <BootstrapSwitchButton
            size={"sm"}
            checked={userFilterValue}
            onChange={(checked) => {
              setUserFilter(checked);
            }}
          />
        </QuickFilter>
        <QuickFilter label={"Szukaj"}>
          <div className={"d-flex align-items-center gap-2"}>
            <Search />
            <input className="search-input" onChange={(e) => setSearchQuery(e.target.value.toLowerCase())} />
          </div>
        </QuickFilter>
      </div>
      <div className={"d-flex justify-content-between align-items-center"}>
        <div>
          <p>{`${visibleSubmissions.length} zgłoszeń`}</p>
        </div>
        <div className="mt-2">
          <Pagination>
            <Pagination.First disabled={page <= 1} onClick={() => setPage(1)} />
            <Pagination.Prev disabled={page <= 1} onClick={() => setPage(p => p - 1)} />
            <Pagination.Item active>{page}</Pagination.Item>
            <Pagination.Next disabled={page >= lastPage} onClick={() => setPage(p => p + 1)} />
            <Pagination.Last disabled={page >= lastPage} onClick={() => setPage(lastPage)} />
          </Pagination>
        </div>
      </div>
      {(droppedFilter && droppedHosts.length) ?
        <div className={"dropped-container"}>{droppedHosts.map(r => <DroppedHost resource={r}
          isCoordinator={isCoordinator}
          key={r.id} />)}</div> : null}
    </div>

    <div className="submission-list px-2" ref={subsList}>
      {isLoading ?
        <LoadingSpinner /> : visibleSubmissions.slice(SHOW_NUMBER * (page - 1), SHOW_NUMBER * page).map(s =>
          <SubmissionRow user={user} sub={s} key={s.id}
            isGroupCoordinator={isCoordinator}
            activeHandler={btnHandler} />)}
    </div>

  </>

  );

};
