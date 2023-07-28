<template>
  <el-dialog :model-value="visible" :title="title" @close="visible = false">
    <Form
      ref="formRef"
      :form-config="formConfig"
      :init-form-data="initFormData"
      :show-btn="false"
      @submit="submit"
    />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm">{{ confirmText }}</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import Form from '@components/Form/index.vue'
const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  initFormData: {
    type: Object,
    default: () => {}
  },
  formConfig: {
    type: Array,
    default: () => []
  },
  confirmText: {
    type: String,
    default: '确定'
  },
  confirmCb: {
    type: Function,
    default: () => {}
  }
})

const visible = ref(false)

const formRef = ref(null)
const handleConfirm = async () => {
  formRef.value.submitForm()
}

watch(visible, (newValue) => {
  if (!newValue) {
    formRef.value?.resetForm()
  }
})

const submit = (e) => {
  props.confirmCb(e)
  visible.value = false
}

defineExpose({
  visible
})
</script>

<style lang="scss" scoped></style>
