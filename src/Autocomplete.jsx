import React, { PropTypes, Component } from 'react'
import classNames from 'classnames'
import TagProp from './utils'

export default class extends Component {
  static propTypes = {
    input: PropTypes.string,
    selected: PropTypes.arrayOf(TagProp),
    tags: PropTypes.arrayOf(TagProp).isRequired,
    select: PropTypes.func.isRequired,
    create: PropTypes.func.isRequired,
    considering: TagProp,
    consider: PropTypes.func.isRequired,
    renderNewOption: PropTypes.func.isRequired,
    loading: PropTypes.bool
  }

  static defaultProps = {
    selected: []
  }

  componentWillReceiveProps(nextProps) {
    const { tags, input, consider, selected } = nextProps

    if (this.props.input && !input) {
      consider(null)
    }

    const noChange = (input === this.props.input) && (tags === this.props.tags)
    if (!input || noChange) {
      return
    }

    const matches = tags.filter(t =>
      t.label.includes(input) && !selected.includes(t)
    )

    if (matches.length) {
      consider(matches[0])
    } else {
      consider(null)
    }
  }

  matchingOptions() {
    const { tags, input, selected } = this.props
    const matches = tags.filter(t =>
      t.label.includes(input) && !selected.map(s => s.value).includes(t.value)
    )
    const values = matches.map(t => t.value)

    return { matches, values }
  }

  considerNext() {
    const { consider, considering } = this.props
    const { matches, values } = this.matchingOptions()

    if (!matches.length) {
      return
    }

    if (!considering) {
      consider(matches[0])
    } else {
      const nextIndex = Math.min(matches.length - 1, values.indexOf(considering.value) + 1)
      consider(matches[nextIndex])
    }
  }

  considerPrevious() {
    const { consider, considering } = this.props
    const { matches, values } = this.matchingOptions()

    if (!matches.length) {
      return
    }

    const currentIndex = values.indexOf(considering.value)
    if (currentIndex === 0) {
      consider(null)
    } else {
      consider(matches[currentIndex - 1])
    }
  }

  render() {
    const { input, select, create, considering, consider, renderNewOption, loading, selected } =
      this.props

    if (loading) {
      return (
        <ul className="autocomplete">
          <li>
            <span className="option-text">
              Loading...
            </span>
          </li>
        </ul>
      )
    }

    if (!input) {
      return false
    }

    const { matches } = this.matchingOptions()
    const exactMatch = matches.find(t => t.label === input)
    const alreadySelected = selected.map(t => t.label).includes(input)

    const addNewOption = !exactMatch && (
      <li
        className={classNames('add-new', { considering: !considering })}
        onClick={create}
        onMouseOver={() => consider(null)}
      >
        <span className="option-text">
          {renderNewOption(input)}
        </span>
      </li>
    )

    const selectedNotice = alreadySelected && (
      <li>
        <span className="option-text">
          Already Selected
        </span>
      </li>
    )

    const content = alreadySelected ? selectedNotice : addNewOption

    const matching = matches.map(t => {
      const className = classNames({
        considering: considering === t
      })

      return (
        <li
          key={t.value}
          className={className}
          onClick={() => select(t)}
          onMouseOver={() => consider(t)}
        >
          <span className="option-text">
            {t.label}
          </span>
        </li>
      )
    })

    return (
      <ul className="autocomplete">
        {content}
        {matching}
      </ul>
    )
  }
}
