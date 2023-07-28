import { computed } from 'vue'
import { camelize } from '@utils/index.js'
const components = {
  input: 'elInput',
  select: 'elSelect',
  radio: 'elRadioGroup',
  date: 'elDatePicker',
  switch: 'elSwitch',
  checkbox: 'elCheckboxGroup'
}

export function formatterComponent(cmpType = '') {
  const camelizeType = camelize(cmpType)
  return components[camelizeType] || camelizeType
}

export function useModifyProps(config) {
  const modifyProps = computed(() => {
    let modifyProps = {}
    const { label } = config
    const type = formatterComponent(config.type)
    switch (type) {
      case 'elInput':
        modifyProps.placeholder = `请输入${label}`
        break
      case 'elSelect':
        modifyProps.placeholder = `请选择${label}`
        modifyProps.style = `width: 100%`

        break
      case 'elDatePicker':
        modifyProps = {
          startPlaceholder: '年/月/日',
          endPlaceholder: '年/月/日',
          valueFormat: 'YYYY-MM-DD',
          type: 'daterange'
        }
        break
      default:
        break
    }
    return {
      ...modifyProps,
      ...config.props
    }
  })
  return { modifyProps }
}

export function useGetSubComponent(config) {
  const type = formatterComponent(config.type)
  const props = config.props
  const subCmpOptions = computed(() => {
    const subCmpOptions = {
      type: null,
      options: []
    }
    switch (type) {
      case 'elSelect':
        subCmpOptions.type = 'elOption'
        subCmpOptions.options = props.options.map((v) => {
          return {
            ...v,
            text: v.label
          }
        })
        break

      case 'elRadioGroup':
        subCmpOptions.type = 'elRadio'
        subCmpOptions.options = props.options.map((v) => {
          return {
            label: v.value,
            text: v.label
          }
        })
        break
      case 'elCheckboxGroup':
        subCmpOptions.type = 'elCheckbox'
        subCmpOptions.options = props.options.map((v) => {
          return {
            label: v.value,
            text: v.label
          }
        })
        break
      default:
        break
    }

    return subCmpOptions
  })

  return {
    subCmpOptions
  }
}
