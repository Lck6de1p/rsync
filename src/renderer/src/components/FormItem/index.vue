<template>
  <component
    :is="componentType"
    v-if="componentType !== 'elDatePicker'"
    v-bind="modifyProps"
    :model-value="value"
    @update:model-value="handleInput"
    @keyup.enter="handleEntry"
  >
    <template v-if="BASE_TAGS.has(componentType)">{{ value }}</template>
    <template v-else>
      <component
        :is="formatterComponent(subCmpOptions.type)"
        v-for="(item, index) in subCmpOptions.options"
        :key="index"
        :value="item.value"
        :label="item.label"
      >
        {{ item.text }}
      </component>
    </template>
  </component>
  <!-- 解决elDatePicker加入插槽导致无法展示的bug -->
  <component
    :is="componentType"
    v-else
    v-bind="modifyProps"
    :model-value="value"
    @update:model-value="handleInput"
  />
</template>

<script setup>
import { computed } from 'vue'
import { BASE_TAGS } from './constants.js'
import { formatterComponent, useGetSubComponent, useModifyProps } from './hooks'
const props = defineProps({
  enterOn: {
    type: Boolean,
    default: false
  },
  itemConfig: {
    type: Object,
    default: () => {}
  },
  modelValue: {
    type: [String, Number, Array, Boolean]
  }
})

const componentType = computed(() => {
  return formatterComponent(props.itemConfig.type)
})

const { modifyProps } = useModifyProps(props.itemConfig)
const { subCmpOptions } = useGetSubComponent(props.itemConfig)

const value = computed(() => {
  return props.modelValue
})

const emit = defineEmits(['update:modelValue', 'submit'])
const handleInput = (e) => {
  emit('update:modelValue', e)
}

const handleEntry = () => {
  if (props.enterOn) {
    emit('submit')
  }
}
</script>

<style scoped></style>
