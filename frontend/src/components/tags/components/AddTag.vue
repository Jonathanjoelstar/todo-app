
<template>
	<form class=" flex flex-row justify-between mb-4" @submit.prevent="addTag">
		<input type="text" v-model="tag.name" placeholder="Ajouter un tag"
			class="pl-2 rounded outline-none border border-gray-200 text-left basis-6/12" />
		<input type="color" v-model="tag.color" class="border basis-1/12" />
		<button type=" submit" class="text-green-500 basis-1/12">
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
				stroke="currentColor" class="h-5 w-5">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
			</svg>
		</button>
	</form>
</template>


<script scoped lang="js" src="../services/AddTag.js" />