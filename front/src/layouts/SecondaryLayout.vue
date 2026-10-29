<template>
  <!-- Sem style="height: 10vh": o invólucro tinha 10% da altura do ecrã e o
       conteúdo transbordava, deixando uma banda morta por baixo do login. -->
  <q-layout view="hHh Lpr lff">
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
