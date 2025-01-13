<template>
	<div class="w-1/8 flex space-x-3 relative">

		<Popover class="relative">
			<PopoverButton data-popover-target="popover-bottom-start" class="outline-none">
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="gray"
					preserveAspectRatio="none" class="h-6 w-6">
					<path stroke-linecap="round" stroke-linejoin="round"
						d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6Z" />
				</svg>
			</PopoverButton>
			<PopoverPanel data-popover="popover-bottom-start" data-popover-placement="bottom-start" as="Listbox">
				<Listbox
					class="block absolute -right-0 top-10 z-10 p-4 font-sans text-sm font-normal break-words whitespace-normal bg-white rounded-lg shadow-lg w-max border-blue-gray-50 text-blue-gray-500 shadow-blue-gray-500/10 h-60 w-72"
					as="div" v-model="selectedTags" multiple>

					<!--Dans un premier fixe, Dev les différentes catégories-->
					<div class="flex justify-between mb-4">
						<ListboxLabel class="rounded border border-slate-200 py-1 px-2 text-left basis-9/12">
							{{ selectedTags[0] ? selectedTags[0].category : 'Sélectionnez des options' }}
						</ListboxLabel>
						<button class="border bg-gray-100 rounded border-blue-gray-500 basis-1/12">
							<!-- Contenu du bouton -->
						</button>
						<button class="basis-1/12">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="green"
								class="size-6">
								<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
							</svg>
						</button>
					</div>

					<ListboxOptions class="max-h-40 w-full overflow-auto scrollbar" static>
						<ListboxOption as="template" v-for="tag in tags" :key="tag.id" :value="tag" v-slot="{ selected }">
							<li class="cursor-pointer select-none py-2 pl-3 pr-9">
								<div class="flex space-x-2">
									<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" :fill="tag.color"
										class="bi bi-circle-fill" viewBox="0 0 16 16">
										<circle cx="8" cy="10" r="6" />
									</svg>
									<span>{{ tag.name }}</span>

									<span v-if="selected">
										<CheckIcon class="size-4 text-blue-500 mt-1" aria-hidden="true" />
									</span>
								</div>
							</li>
						</ListboxOption>
					</ListboxOptions>

				</Listbox>
			</PopoverPanel>
		</Popover>

	</div>

</template>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<script scoped lang="js" src="../services/TagList.js" />