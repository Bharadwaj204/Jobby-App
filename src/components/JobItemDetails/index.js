import {Component} from 'react'
import {withRouter} from 'react-router-dom'
import {FaStar} from 'react-icons/fa'
import {MdLocationOn, MdWork} from 'react-icons/md'
import Loader from 'react-loader-spinner'
import Cookies from 'js-cookie'
import Header from '../Header'
import './index.css'

class JobItemDetails extends Component {
  state = {
    jobDetails: {},
    similarJobs: [],
    isLoading: true,
    isError: false,
  }

  componentDidMount() {
    this.getJobDetails()
  }

  getJobDetails = async () => {
    const {match} = this.props
    const {id} = match.params
    const apiUrl = `https://apis.ccbp.in/jobs/${id}`
    const jwtToken = Cookies.get('jwt_token')

    try {
      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      })
      const data = await response.json()
      if (response.ok) {
        this.setState({
          jobDetails: data.job_details,
          similarJobs: data.similar_jobs,
          isLoading: false,
          isError: false,
        })
      } else {
        this.setState({isError: true, isLoading: false})
      }
    } catch (error) {
      this.setState({isError: true, isLoading: false})
    }
  }

  renderSkills = skills => (
    <ul className="skills-list">
      {skills.map(skill => (
        <li key={skill.name} className="skill-item">
          <img src={skill.image_url} alt={skill.name} className="skill-img" />
          <p>{skill.name}</p>
        </li>
      ))}
    </ul>
  )

  renderSimilarJobs = similarJobs => (
    <ul className="similar-jobs-list">
      {similarJobs.map(job => (
        <li key={job.id} className="similar-job-item">
          <img
            src={job.company_logo_url}
            alt="similar job company logo"
            className="company-logo"
          />
          <h1>{job.title}</h1>
          <div className="rating-container">
            <FaStar className="star-icon" />
            <p>{job.rating}</p>
          </div>
          <div className="location-employment-container">
            <p>{job.location}</p>
            <p>{job.employment_type}</p>
          </div>
          <h1>Description</h1>
          <p>{job.job_description}</p>
        </li>
      ))}
    </ul>
  )

  renderJobDetails = () => {
    const {jobDetails, similarJobs} = this.state
    const {
      company_logo_url: companyLogoUrl,
      company_website_url: companyWebsiteUrl,
      employment_type: employmentType,
      job_description: jobDescription,
      location,
      package_per_annum: packagePerAnnum,
      rating,
      title,
      skills = [],
      life_at_company: lifeAtCompany = {},
    } = jobDetails

    return (
      <div className="job-details-container">
        <div className="job-details-card">
          <img
            src={companyLogoUrl}
            alt="job details company logo"
            className="company-logo"
          />
          <div className="title-rating-container">
            <h1 className="title">{title}</h1>
            <div className="rating-container">
              <FaStar className="star-icon" />
              <p className="rating">{rating}</p>
            </div>
          </div>
          <div className="location-employment-container">
            <MdLocationOn className="location-icon" />
            <p className="location">{location}</p>
            <MdWork className="employment-icon" />
            <p className="employment-type">{employmentType}</p>
            <p className="package">{packagePerAnnum}</p>
          </div>
          <a
            href={companyWebsiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="company-website-link"
          >
            Visit
          </a>
          <h1>Description</h1>
          <p>{jobDescription}</p>
          <h1>Skills</h1>
          {this.renderSkills(skills)}
          <h1>Life at Company</h1>
          <div className="life-at-company">
            <img
              src={lifeAtCompany.image_url}
              alt="life at company"
              className="life-at-company-img"
            />
            <p>{lifeAtCompany.description}</p>
          </div>
        </div>
        <h1>Similar Jobs</h1>
        {this.renderSimilarJobs(similarJobs)}
      </div>
    )
  }

  render() {
    const {isLoading, isError} = this.state

    let content
    if (isLoading) {
      content = (
        <div className="loader-container" data-testid="loader">
          <Loader type="ThreeDots" color="#ffffff" height="50" width="50" />
        </div>
      )
    } else if (isError) {
      content = (
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
          <button
            type="button"
            className="retry-button"
            onClick={this.getJobDetails}
          >
            Retry
          </button>
        </div>
      )
    } else {
      content = this.renderJobDetails()
    }

    return (
      <div className="job-item-details-page">
        <Header />
        {content}
      </div>
    )
  }
}

export default withRouter(JobItemDetails)
