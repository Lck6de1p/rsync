<template>
  <el-form ref="ruleFormRef" :model="formData" :label-width="labelWidth" :class="{ grid: inline }">
    <el-form-item
      v-for="(item, index) in formConfig"
      v-show="!collapse ? true : index < 3"
      :key="item.key"
      :label="item.label"
      :prop="item.key"
      :rules="item.rules"
    >
      <form-item
        v-model="formData[item.key]"
        :item-config="item"
        :enter-on="enterOn"
        @submit="submitForm"
      />
    </el-form-item>
    <el-form-item v-if="showBtn" label=" ">
      <el-button type="primary" @click="submitForm()"> {{ searchText }} </el-button>
      <el-button @click="resetForm()">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: 'FormComponent'
}
</script>
<script setup>
import { reactive, unref, ref, watch, computed } from 'vue'
import FormItem from '../FormItem/index.vue'
const props = defineProps({
  initFormData: {
    type: Object,
    default: () => {}
  },
  formConfig: {
    type: Array,
    default: () => []
  },
  labelWidth: {
    type: Number,
    default: 110
  },
  searchText: {
    type: String,
    default: '查询'
  },
  enterOn: {
    type: Boolean,
    default: false
  },
  showBtn: {
    type: Boolean,
    default: true
  },
  inline: {
    type: Boolean,
    default: false
  },
  collapse: {
    type: Boolean,
    default: true
  }
})

const emits = defineEmits(['reset', 'submit'])
const ruleFormRef = ref()

const submitForm = async () => {
  if (!ruleFormRef.value) return
  await ruleFormRef.value.validate((valid, fields) => {
    if (valid) {
      emits('submit', formatter())
    } else {
      console.log('error submit!', fields)
    }
  })
}

const resetForm = () => {
  ruleFormRef.value.resetFields()
}

defineExpose({
  submitForm,
  resetForm
})

let formData = reactive({})
watch(
  () => props.initFormData,
  () => {
    formData = reactive(props.initFormData ? unref(props.initFormData) : {})
  },
  { immediate: true }
)

const keyFormatters = computed(() => {
  return props.formConfig.reduce((total, pre) => {
    if (pre.keyFormatter) {
      return { ...total, [pre.key]: pre.keyFormatter }
    }
    return total
  }, {})
})

const formatter = () => {
  let res = { ...formData }
  for (const key in formData) {
    if (formData[key] === undefined) {
      delete res[key]
    }
    const keyFormatter = keyFormatters.value[key]
    if (keyFormatter) {
      res = { ...res, ...keyFormatter(formData[key]) }
    }
  }
  return res
}
</script>

<style lang="scss">
.grid {
  display: grid;
  grid-template-columns: repeat(3, 33.3%);
}
</style>
