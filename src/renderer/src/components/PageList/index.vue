<template>
  <div ref="listPageRef">
    <div ref="searchAreaRef" class="search-area">
      <div class="flex">
        <Form
          ref="formRef"
          class="flex1"
          enter-on
          inline
          :show-btn="false"
          :form-config="formConfig"
          :label-width="labelWidth"
          :init-form-data="initFormData"
          :collapse="collapse"
          @submit="handleSearch"
        />
        <div class="flex-btn">
          <div
            v-if="formConfig.length && formConfig.length > 4"
            class="collapse-icon"
            :class="{ 'is-collapse': !collapse }"
            @click="collapse = !collapse"
          >
            <el-icon>
              <ArrowDown />
            </el-icon>
          </div>
          <el-button type="primary" @click="submitForm">查询</el-button>
          <el-button @click="resetForm">重置</el-button>
          <footer>
            <slot name="extra-btns" />
          </footer>
        </div>
      </div>
    </div>
    <div ref="slotRef">
      <slot />
    </div>
    <div class="comp-table table-area">
      <el-table :data="_tableData" border style="width: 100%" v-bind="$attrs">
        <el-table-column v-if="selection" type="selection" width="55" />
        <template v-for="(item, index) in columns" :key="index">
          <el-table-column v-bind="item">
            <template v-if="item.render" #default="scoped">
              <Render :ctx="scoped" :render="item.render" />
            </template>
          </el-table-column>
        </template>
      </el-table>
      <div ref="paginationAreaRef" class="pagination-area">
        <el-pagination
          v-model:current-page="page.currentPage"
          v-model:page-size="page.pageSize"
          :page-sizes="[100, 200, 300, 400]"
          background
          layout="prev, pager, next, sizes, total"
          :total="totalCount"
          @size-change="setSize"
          @current-change="setCurrent"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ListPage'
}
</script>
<script setup>
import { ref } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'
import Render from '@components/CustomRender/index.js'
import Form from '@components/Form/index.vue'
import { usePagination } from '@hooks'
// import { useGetTableHeight } from './useGetTableHeight'
import { useTableData } from './useTableData'

const props = defineProps({
  // 查询条件渲染数组
  formConfig: {
    type: Array,
    default: () => []
  },
  // 查询form的label宽度
  labelWidth: {
    type: Number,
    default: 80
  },
  // 查询条件默认值
  initFormData: {
    type: Object,
    default: () => {}
  },
  // 渲染table表格数组
  columns: {
    type: Array,
    default: () => []
  },
  // 是否多选
  selection: {
    type: Boolean,
    default: false
  },
  // 后端请求地址
  request: {
    type: String,
    default: ''
  },
  // 请求方法
  methods: {
    type: String,
    default: 'post'
  },
  // 传入固定的table数据，在不填写后端请求地址request的时候生效
  tableData: {
    type: Array,
    default: () => []
  }
})

const collapse = ref(true)

// const searchAreaRef = ref(null)
// const listPageRef = ref(null)
// const paginationAreaRef = ref(null)
// const slotRef = ref(null)
// const { height } = useGetTableHeight(listPageRef, searchAreaRef, paginationAreaRef, slotRef)

const { page, totalCount, setCurrent, setSize, setTotal } = usePagination()

const formData = ref({})
const formRef = ref(null)
const submitForm = () => {
  formRef.value?.submitForm()
}
const resetForm = () => {
  formRef.value?.resetForm()
}
const reset = () => {
  formData.value = { ...formData.value }
  setCurrent(1)
}
const handleSearch = (e) => {
  formData.value = e
  setCurrent(1)
}

const _tableData = useTableData(props, formData, page, setTotal)

defineExpose({
  reset
})
</script>

<style lang="scss" scoped>
.search-area {
  padding: 10px 10px 0 10px;
  background-color: #fff;
  margin-bottom: 5px;
  :deep(.el-form--inline .el-form-item) {
    margin-right: 10px;
  }
  .flex {
    display: flex;
    .flex1 {
      flex-grow: 1;
      min-width: 0;
    }
    .flex-btn {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      height: 33px;
      margin-left: 12px;
    }
  }
}
.table-area {
  padding: 10px;
  background-color: #fff;
}
.pagination-area {
  margin-top: 10px;
  display: flex;
  justify-content: center;
}

.collapse-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-right: 10px;
  font-size: 12px;
  color: #a1a7b8;
  background-color: rgb(236, 238, 245);
  transition: all 300ms ease-in;
  cursor: pointer;
}
.is-collapse {
  transform: rotate(180deg);
}
</style>
