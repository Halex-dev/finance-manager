<script lang="ts" setup>
import RevenueUpdates from './cards/RevenueReport.vue'
import YearlyBreakup from './cards/YearlyBreakup.vue'
import MonthlyEarnings from './cards/MonthlyEarnings.vue'
//import Timeline from './cards/Timeline.vue'

//import DataSection from './DataSection.vue'
import MoneyRuleSection from './components/MoneyRuleSection.vue'
import ChartSection from './components/ChartSection.vue'
</script>

<template>
  <h1 class="page-title font-bold">Dashboard</h1>
  <section class="flex flex-col gap-4">
    <div class="flex flex-col sm:flex-row gap-4">
      <RevenueUpdates class="w-full sm:w-[70%]" />
      <div class="flex flex-col gap-4 w-full sm:w-[30%]">
        <YearlyBreakup class="h-full" />
        <MonthlyEarnings />
      </div>
    </div>
    <!-- <DataSection /> -->
    <MoneyRuleSection />
    <ChartSection />
    <div class="flex flex-col md:flex-row gap-4">
      <!-- <RevenueByLocationMap class="w-full md:w-4/6" /> -->
      <!-- <RegionRevenue class="w-full md:w-2/6" /> -->
      <!-- <Timeline class="w-full md:w-1/2" /> -->
    </div>
  </section>
</template>
