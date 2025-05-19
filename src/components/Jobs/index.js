import {Component} from 'react'
import {BsSearch} from 'react-icons/bs'
import Cookies from 'js-cookie'
import Header from '../Header'
import Profile from '../Profile'
import JobCard from '../JobCard'
import './index.css'

class Jobs extends Component {
  state = {
    jobsList: [],
    searchInput: '',
    employmentType: [],
    minimumPackage: '',
    isLoading: true,
    error: null,
  }

  employmentTypesList = [
    {employmentTypeId: 'FULLTIME', label: 'Full Time'},
    {employmentTypeId: 'PARTTIME', label: 'Part Time'},
    {employmentTypeId: 'FREELANCE', label: 'Freelance'},
    {employmentTypeId: 'INTERNSHIP', label: 'Internship'},
  ]

  salaryRangesList = [
    {salaryRangeId: '1000000', label: '10 LPA and above'},
    {salaryRangeId: '2000000', label: '20 LPA and above'},
    {salaryRangeId: '3000000', label: '30 LPA and above'},
    {salaryRangeId: '4000000', label: '40 LPA and above'},
  ]

  componentDidMount() {
    console.log('Jobs component mounted')
    const jwtToken = Cookies.get('jwt_token')
    console.log('JWT Token:', jwtToken ? 'Present' : 'Missing')
    this.getJobs()
  }

  componentDidUpdate(prevProps, prevState) {
    const {employmentType, minimumPackage} = this.state
    const {
      employmentType: prevEmploymentType,
      minimumPackage: prevMinimumPackage,
    } = prevState

    if (
      prevEmploymentType !== employmentType ||
      prevMinimumPackage !== minimumPackage
    ) {
      this.getJobs()
    }
  }

  getJobs = async () => {
    console.log('Fetching jobs...')
    const {searchInput, employmentType, minimumPackage} = this.state
    this.setState({isLoading: true})
    try {
      const jwtToken = Cookies.get('jwt_token')
      if (!jwtToken) {
        console.error('No JWT token found')
        this.setState({error: 'Authentication required'})
        return
      }

      const employmentTypeString = employmentType.join(',')
      const apiUrl = `https://apis.ccbp.in/jobs?employment_type=${employmentTypeString}&minimum_package=${minimumPackage}&search=${searchInput}`
      console.log('API URL:', apiUrl)

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        // Force HTTP/1.1
        cache: 'no-cache',
        credentials: 'same-origin',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('API Response:', data)

      if (response.ok) {
        this.setState({jobsList: data.jobs, error: null})
      } else {
        this.setState({error: data.error_msg})
      }
    } catch (err) {
      console.error('Error fetching jobs:', err)
      this.setState({
        error: 'Failed to fetch jobs. Please try again later.',
        isLoading: false,
      })
    } finally {
      this.setState({isLoading: false})
    }
  }

  handleSearch = () => {
    this.getJobs()
  }

  handleEmploymentTypeChange = event => {
    const {value, checked} = event.target
    const {employmentType} = this.state
    if (checked) {
      this.setState({employmentType: [...employmentType, value]})
    } else {
      this.setState({
        employmentType: employmentType.filter(type => type !== value),
      })
    }
  }

  handleSalaryRangeChange = event => {
    this.setState({minimumPackage: event.target.value})
  }

  renderSearchBar = () => {
    const {searchInput} = this.state
    return (
      <div className="search-container">
        <input
          type="search"
          className="search-input"
          placeholder="Search"
          value={searchInput}
          onChange={e => this.setState({searchInput: e.target.value})}
          onKeyDown={e => e.key === 'Enter' && this.handleSearch()}
        />
        <button
          type="button"
          className="search-button"
          onClick={this.handleSearch}
          data-testid="searchButton"
        >
          <BsSearch className="search-icon" />
        </button>
      </div>
    )
  }

  renderEmploymentTypeFilters = () => (
    <div className="filter-container">
      <h1 className="filter-heading">Type of Employment</h1>
      <ul className="filter-list">
        {this.employmentTypesList.map(eachType => (
          <li key={eachType.employmentTypeId} className="filter-item">
            <input
              type="checkbox"
              id={eachType.employmentTypeId}
              value={eachType.employmentTypeId}
              onChange={this.handleEmploymentTypeChange}
              className="filter-input"
            />
            <label htmlFor={eachType.employmentTypeId} className="filter-label">
              {eachType.label}
            </label>
          </li>
        ))}
      </ul>
    </div>
  )

  renderSalaryRangeFilters = () => (
    <div className="filter-container">
      <h1 className="filter-heading">Salary Range</h1>
      <ul className="filter-list">
        {this.salaryRangesList.map(eachRange => (
          <li key={eachRange.salaryRangeId} className="filter-item">
            <input
              type="radio"
              id={eachRange.salaryRangeId}
              name="salary"
              value={eachRange.salaryRangeId}
              onChange={this.handleSalaryRangeChange}
              className="filter-input"
            />
            <label htmlFor={eachRange.salaryRangeId} className="filter-label">
              {eachRange.label}
            </label>
          </li>
        ))}
      </ul>
    </div>
  )

  renderJobsList = () => {
    const {isLoading, error, jobsList} = this.state

    if (isLoading) {
      return (
        <div className="loader-container" data-testid="loader">
          <div className="loader">Loading...</div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="failure-container">
          <img
            src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
            alt="failure view"
            className="failure-img"
          />
          <h1 className="failure-heading">Oops! Something Went Wrong</h1>
          <p className="failure-description">
            We cannot seem to find the page you are looking for.
          </p>
          <button type="button" className="retry-button" onClick={this.getJobs}>
            Retry
          </button>
        </div>
      )
    }

    if (jobsList.length === 0) {
      return (
        <div className="no-jobs-container">
          <img
            src="https://assets.ccbp.in/frontend/react-js/no-jobs-img.png"
            alt="no jobs"
            className="no-jobs-img"
          />
          <h1 className="no-jobs-heading">No Jobs Found</h1>
          <p className="no-jobs-description">
            We could not find any jobs. Try other filters.
          </p>
        </div>
      )
    }

    return (
      <ul className="jobs-list">
        {jobsList.map(eachJob => (
          <JobCard key={eachJob.id} jobData={eachJob} />
        ))}
      </ul>
    )
  }

  render() {
    return (
      <div className="jobs-container">
        <Header />
        <div className="jobs-content">
          <div className="filters-section">
            {this.renderSearchBar()}
            <Profile />
            {this.renderEmploymentTypeFilters()}
            {this.renderSalaryRangeFilters()}
          </div>
          <div className="jobs-section">{this.renderJobsList()}</div>
        </div>
      </div>
    )
  }
}

export default Jobs
