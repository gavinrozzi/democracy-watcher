import React from 'react'
import I18n from 'i18n-js'

import ProgressBar from '../Utils/ProgressBar'
import ReactChart from '../Statistic/ReactChart'
import {connect} from 'react-redux'
import {getPromisesList} from '../../state/promises/selectors'


const CHART_OPTIONS = {
  tooltips: {displayColors: false}
}

const CHART_PROMISE_STATUSES_COLORS = {
  done: '#5dac5d',
  in_progress: '#d2c500',
  not_yet_started: '#ea7000',
  broken: '#dc4040'
}

@connect(state => ({promises: getPromisesList(state)}))
export default class PromisesStatistics extends React.PureComponent {
  render() {
    // Mandate duration
    const date_start = new Date(this.props.ruling_entity.mandate_start)
    const date_end = new Date(this.props.ruling_entity.mandate_end)
    const total_mandate_duration = Math.ceil(((date_end - date_start) || 1) / 86400000)
    const time_in_office = Math.min(Date.now(), date_end.getTime()) - date_start.getTime()
    const days_in_office = Math.floor(time_in_office / 86400000)
    const mandate_progress = Math.floor(days_in_office / total_mandate_duration * 100)
    // Use a different description for past / present mandated
    let mandate_duration_description = null
    if (Date.now() > date_end.getTime())
      mandate_duration_description = I18n.t('mandate_terminated')
    else
      mandate_duration_description = I18n.t('days_in_office', {nb_days: days_in_office})

    // Main block
    return (
      <div id='mandate-statistics'>
        { mandate_duration_description }
        <ProgressBar progress={mandate_progress}/>
        {this.renderPromisesChart()}
      </div>
    )
  }

  renderPromisesChart() {
    if (this.props.promises.size === 0)
      return null
    const promisesStatusesCount = this.props.promises.countBy((promise) => promise.status)
    const promisesStatusesKeys = Array.from(promisesStatusesCount.keys())
    const chartData = {
      labels: promisesStatusesKeys.map(k => String(I18n.t(`models.promise.status.${k}`))),
      datasets: [{
        data: promisesStatusesKeys.map(k => promisesStatusesCount.get(k)),
        backgroundColor: Object.values(CHART_PROMISE_STATUSES_COLORS)
      }]
    }
    const chartId = `promises-status-count-chart-${this.props.ruling_entity.id}`
    return (
      <ReactChart id={chartId} className='promises-status-count-chart'
                  data-type='doughnut'
                  data-options={CHART_OPTIONS}
                  data-chart-data={chartData}
      />
    )
  }
}