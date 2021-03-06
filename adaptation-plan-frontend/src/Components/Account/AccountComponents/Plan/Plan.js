import React, {useState, useEffect, createRef, useLayoutEffect} from 'react';
import { connect } from 'react-redux'
import {Redirect} from "react-router-dom";
import './Plan.css';
import SelectList from "../SelectList";
import {addNewTask, getPlan} from "../../../../redux/actions/adaptationPlan";

import BeginThePlan from "./BeginThePlan";
import MainInfo from "./MainInfo";
import Task from "./Task";
import {getDirectors, getEmployees} from "../../../../redux/actions/employeesPlan";
import Loader from "../Loader";

function Plan(props) {

  const [token, setToken] = useState(localStorage.getItem('token'))
  const [stage, setStage] = useState('')
  const [fioEmployee, setfioEmployee] = useState('')
  const addTask = () => {
    props.addTask({token: token, payload: {_id: props.plan._id}})
  }
  const updateStage = (value) => {
    setStage(value)
  }
  
  const setEmployee = (value) => {
    setfioEmployee(value)
    if (!props.plan) setStage('Подготовка')
  }
  
  useEffect(() => {
    if (props.plan){
      setStage(props.plan.stage)
    }
    else
      setStage('Подготовка')
  }, [props.plan])
  
  useEffect(() => {
    document.title = "План адаптации"
    if (props.profile.role !== 'Сотрудник')
      props.getEmployees({token: token})
    setStage('')
    setfioEmployee('')
    if (props.profile.role === 'Сотрудник') {
      props.fetchPlan({token: token})
    }
  }, [])
  
//  ------------------------------------------------------------
  if (token){
      if (props.profile.role === "HR-Сотрудник") {
        return (
          <div className="plan">
            <div className="tasks">
              <div className="select">
                <SelectList setfioEmployee={setEmployee}/>
                {props.plan && fioEmployee &&props.plan.stage !== 'Создание плана' && props.plan.stage !== 'Оценка руководителем' && props.plan.stage !== 'Оценка завершена' && <button className='addTask' onClick={addTask}/>}
                {stage === 'Подготовка' && !props.plan && !props.loadingPlan
                  ?
                  <div className="board"><BeginThePlan updateStage={updateStage}/></div>
                :
                  fioEmployee && props.loadingPlan && <Loader/>
                }
              </div>
              {props.plan && props.plan.tasks && fioEmployee && !props.loadingPlan ? props.plan.tasks.map((task, index) => {
                return <Task task={task} key={index} index={index}/>
              }) : null}
            </div>
            {stage === 'Начало' && !props.plan && !props.loadingPlan && fioEmployee && <div className="structurePlan"><MainInfo fioEmployee={fioEmployee}/></div>}
            {props.plan && !props.loadingPlan && fioEmployee && <div className="structurePlan"><MainInfo fioEmployee={fioEmployee}/></div>}
          </div>
        )
      }
      if (props.profile.role === 'Руководитель') {
        return (
          <div className="plan">
            <div className="tasks">
              <div className="select">
                <SelectList updateStage={updateStage} setfioEmployee={setEmployee}/>
                {props.plan && fioEmployee ? props.plan.stage === 'Заполнение сотрудником' && <button className='addTask' onClick={addTask}/> : props.loadingPlan && <Loader/>}
              </div>
              {props.plan.tasks && fioEmployee && !props.loadingPlan ? props.plan.tasks.map((task, index) => {
                return <Task task={task} key={index} index={index}/>
              }) :  props.loadingPlan && <Loader/>}
            </div>
            {props.plan && fioEmployee && !props.loadingPlan ?
            <div className="structurePlan"><MainInfo fioEmployee={fioEmployee}/></div> : props.loadingPlan && <Loader/>}
          </div>
        )
      }
      if (props.profile.role === 'Сотрудник') {
        if (props.plan)
          return (
            <div className="plan">
              <div className="tasksEmployee">
                {props.plan.tasks && !props.loadingPlan ? props.plan.tasks.map((task, index) => {
                  return <Task task={task} key={index} index={index}/>
                }) : null}
                {props.plan.stage === 'Создание плана' && !props.loadingPlan
                  ?
                (<div className='addTaskEmployee'>
                  <button className='addTask' onClick={addTask}/>
                </div>)
                :
                  props.loadingPlan && <Loader/>
                }
              </div>
              {(props.plan.stage && !props.loadingPlan) &&
              <div className="structurePlan"><MainInfo/></div>}
            </div>
          )
        else
          if (props.loadingPlan)
            return (<Loader/>)
          else
            return (<div className="action">План пока не создан</div>)
      }
    }
/*  }*/
  else
    return <Redirect to="/" />
}

const mapStateToProps = state => {
  return {
    plan: state.adaptationPlanReducer.plan,
    profile: state.profileReducer.profile,
    employees: state.employeesPlanReducer.employees,
    directors: state.employeesPlanReducer.directors,
    loadingEmployees: state.employeesPlanReducer.loading,
    loadingPlan: state.adaptationPlanReducer.loadingPlan,
  }
}
const mapDispatchToProps = dispatch => {
  return {
    addTask: (object) => dispatch(addNewTask(object.payload, object.token)),
    fetchPlan: (object) => dispatch(getPlan(object.token)),
    getDirectors: (object) => dispatch(getDirectors(object.token)),
    getEmployees: (object) => dispatch(getEmployees(object.token))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Plan)